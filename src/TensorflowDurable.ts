import * as tensorflow from '@tensorflow/tfjs'
import * as toxicity from '@tensorflow-models/toxicity'
interface Value {
  toxicityModel: toxicity.ToxicityClassifier
}

interface RequestBody {
  messages: string[]
}

const THRESHOLD = 0.7
function splitArrayIntoChunksOfLen (arr: ArrayBuffer, len: number): ArrayBuffer[] {
  let chunks = [], i = 0, n = arr.byteLength;
  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
}
export class TensorflowDurable {
  initializePromise?: Promise<void>
  value!: Value
  state: DurableObjectState
  env: { [key: string]: string }
  toxicity!: toxicity.ToxicityClassifier
  async toxicityFetch (self: this, path: string, requestInits?: RequestInit | undefined, options?: tensorflow.io.RequestDetails | undefined) {
    const lengthCheck : {
      length: number,
      bytes: number
    } = await this.state.storage.get(`${path}:LENGTH`)
    if (lengthCheck !== undefined) {
      const { bytes, length } = lengthCheck
      const buffer = new Uint8Array(bytes)
      let idx = 0
      let last = 0
      for (const ab of await Promise.all([...new Array(length)].map(() => this.state.storage.get<ArrayBuffer>(`${path}:${idx++}`)))) {
        buffer.set(new Uint8Array(ab), last)
        last += ab.byteLength
      }
      const res = new Response(buffer.buffer)
      return res
    }
    const data = await fetch(path, requestInits)
    const str = await data.arrayBuffer()
    const split = splitArrayIntoChunksOfLen(str, 32000)
    const promises: Promise<any>[] = []
    promises.push(this.state.storage.put(`${path}:LENGTH`, {
      length: split.length,
      bytes: str.byteLength
    }))
    for (let index = 0; index < split.length; index++) {
      promises.push(this.state.storage.put(`${path}:${index}`, split[index]))
    }
    await Promise.all(promises)
    return new Response(str)
  }


  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env
    tensorflow.setPlatform('cloudflare', {
      // @ts-ignore
      fetch: (path, requestInits, c) => {
        return this.toxicityFetch(this, path, requestInits)
      },
      now: Date.now,
      // @ts-ignore
      decode: (text: string, encoding: string) => {
        // @ts-ignore
        return Buffer.from(text, encoding).toString()
      },
      // @ts-ignore
      encode: (bytes: Uint8Array, encoding: string) => {
        // @ts-ignore
        return Buffer.from(bytes).toString(encoding)
      },
      loadInSerial: true
    })
    tensorflow.setBackend('cpu')
  }

  async loadModel (): Promise<toxicity.ToxicityClassifier> {
    const loadStart = Date.now()
    console.log('Loading model', loadStart)
    const model = await toxicity.load(THRESHOLD, [])
    console.log('loaded model', Date.now() - loadStart)
    return model
  }

  async initialize() {
    this.toxicity = await this.loadModel()
  }

  async fetch(request: Request) {
    if (request.headers.get('purge') === 'REINIT') {
      this.initializePromise = undefined
      return new Response('We purged baby!!')
    }
    if (request.headers.get('purge') === 'PURGE') {
      await this.state.storage.deleteAll()
      this.initializePromise = undefined
      return new Response('We purged baby!!')
    }
    if (this.initializePromise === undefined) {
      this.initializePromise = this.initialize()
      .catch((err) => {
        console.log('CAUGHT THE ERROR', err)
        // If anything throws during initialization then we need to be
        // sure sure that a future request will retry initialize().
        // Note that the concurrency involved in resetting this shared
        // promise on an error can be tricky to get right -- we don't
        // recommend customizing it.
        this.initializePromise = undefined;
        throw err
      })
    }
    await this.initializePromise;
    const data = await request.json() as RequestBody
    const clasification = await this.toxicity.classify(data.messages)
    const headers = new Headers()
    headers.set('content-type', 'application/json')
    return new Response(JSON.stringify({ clasification }), {
      headers
    })
  }
}