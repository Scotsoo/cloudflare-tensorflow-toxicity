import * as tensorflow from '@tensorflow/tfjs'
import * as toxicity from '@tensorflow-models/toxicity'
interface Value {
  toxicityModel: toxicity.ToxicityClassifier
}

interface RequestBody {
  messages: string[]
}

const THRESHOLD = 0.7
export class TensorflowDurable {
  initializePromise?: Promise<void>
  value!: Value
  state: DurableObjectState
  env: { [key: string]: string }
  toxicity!: toxicity.ToxicityClassifier
  async toxicityFetch (self: this, path: string, requestInits?: RequestInit | undefined, options?: tensorflow.io.RequestDetails | undefined) {
    const stored = await this.state.storage.get(path) as ArrayBuffer
    if (stored !== undefined) {
      return new Response(stored)
    }
    console.log('path', path)
    const data = await fetch(path, requestInits)
    const str = await data.arrayBuffer()
    console.log(path, 'bytes', str.byteLength)
    await this.state.storage.put(path, str)
    return new Response(str)
    // return await fetch(path, requestInits)
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
        return new Buffer(text, encoding).toString()
      },
      // @ts-ignore
      encode: (bytes: Uint8Array, encoding: string) => {
        // @ts-ignore
        return new Buffer(bytes).toString(encoding)
      },
      loadInSerial: true
    })
    tensorflow.setBackend('cpu')
  }

  async loadModel (): Promise<toxicity.ToxicityClassifier> {
    const model = await toxicity.load(THRESHOLD, [])
    return model
  }

  async initialize() {
    // let stored = await this.state.storage.get("state") as Value | undefined
    // this.value = stored || {
    //   toxicityModel: await this.loadModel()
    // }
    const loadStart = Date.now()
    console.log('Loading model', loadStart)
    this.toxicity = await this.loadModel()
    console.log('loaded model', Date.now() - loadStart)
    // this.toxicityModel = this.loadModel()
    // console.log('MODEL', this.value.toxicityModel)
    //   if (stored === undefined) {
    //     // @ts-ignore
    //     delete this.value.toxicityModel.model.handler.fetch
    //     this.state.storage.put('state', this.value)
    //   }
    //   // @ts-ignore
    //   this.value.toxicityModel.model.handler.fetch = toxicityFetch
  }

  async fetch(request: Request) {
    if (request.headers.get('purge') === 'PURGE') {
      await this.state.storage.delete('state')
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
    const modelLoadStart = Date.now()
    await this.initializePromise;
    const modelLoadEnd = Date.now()
    const data = await request.json() as RequestBody
    const now = Date.now()
    console.log(`starting clasification`, now)
    // @ts-ignore
    const clasification = await this.toxicity.classify(data.messages)
    // @ts-ignore
    console.log(`clasification took`, Date.now() - now)
    const headers = new Headers()
    headers.set('content-type', 'application/json')
    return new Response(JSON.stringify({ clasification, CLASSIFICATION_TIME_TAKEN: Date.now() - now, MODEL_LOAD_TIME: modelLoadEnd - modelLoadStart }), {
      headers
    })
  }


}