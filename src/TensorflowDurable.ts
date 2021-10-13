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
  fetchQueue: string[] = []
  fetching: string[] = []
  processing: string = ''
  async toxicityFetch (self: this, path: string, requestInits?: RequestInit | undefined, options?: tensorflow.io.RequestDetails | undefined) {
    this.fetchQueue.push(path)
    // Make sure we're only processing 2 files at a time cause durable objects can take upto 5 connections at once
    while (this.fetching.length > 2) {
      await new Promise(resolve => {
        setTimeout(() => {
          return resolve(0)
        }, 100)
      })
    }
    this.fetching.push(path)
    this.fetchQueue.splice(this.fetchQueue.indexOf(path), 1)
    const lengthCheck : {
      length: number,
      bytes: number
    } = await this.state.storage.get(`${path}:LENGTH`)
    if (lengthCheck !== undefined) {
      const { bytes, length } = lengthCheck
      const buffer = new Uint8Array(bytes)
      let idx = 0
      let last = 0
      let promises: Array<Promise<ArrayBuffer>> = []
      for (const iterator of [...new Array(length)]) {
        if (promises.length === 5) {
          for (const ab of await Promise.all(promises)) {
            buffer.set(new Uint8Array(ab), last)
            last += ab.byteLength
          }
          promises = []
        }
        promises.push(this.state.storage.get(`${path}:${idx++}`))
      }
      if (promises.length > 0) {
        for (const ab of await Promise.all(promises)) {
          buffer.set(new Uint8Array(ab), last)
          last += ab.byteLength
        }
        promises = []
      }
      const res = new Response(buffer.buffer)
      this.fetching.splice(this.fetching.indexOf(path), 1)
      return res
    }
    const data = await fetch(path, requestInits)
    const str = await data.arrayBuffer()
    const split = splitArrayIntoChunksOfLen(str, 32000)
    const promises: Promise<void>[] = []
    promises.push(this.state.storage.put(`${path}:LENGTH`, {
      length: split.length,
      bytes: str.byteLength
    }))
    for (let index = 0; index < split.length; index++) {
      promises.push(this.state.storage.put(`${path}:${index}`, split[index]))
    }
    await Promise.all(promises)
    this.fetching.splice(this.fetching.indexOf(path), 1)
    return new Response(str)
  }


  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env
    tensorflow.setPlatform('cloudflare', {
      fetch: (path, requestInits, c) => {
        return this.toxicityFetch(this, path, requestInits)
      },
      now: Date.now,
      decode: (text: Uint8Array, encoding: string) => {
        // @ts-ignore
        return Buffer.from(text, encoding).toString()
      },
      encode: (text: string, encoding: string): Uint8Array => {
        // @ts-ignore
        return Buffer.from(bytes).toString(encoding)
      }
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
    console.log('init promise', this.initializePromise)
    const data = await request.json() as RequestBody
    const clasification = await this.toxicity.classify(data.messages)
    const headers = new Headers()
    headers.set('content-type', 'application/json')
    headers.set("Access-Control-Allow-Origin",  "*")
    headers.set("Access-Control-Allow-Methods",  "GET,HEAD,POST,OPTIONS")
    headers.set("Access-Control-Max-Age",  "86400")
    return new Response(JSON.stringify({ clasification }), {
      headers
    })
  }
}