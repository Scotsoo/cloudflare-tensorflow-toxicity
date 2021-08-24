import type tensorflow from '@tensorflow/tfjs'
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
  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env
  }

  async loadModel (): Promise<toxicity.ToxicityClassifier> {
    console.log('loading model')
    const model = await toxicity.load(THRESHOLD, [])
    console.log('model loaded')
    return model
  }

  async initialize() {
    console.log('init called')
    let stored = await this.state.storage.get("state") as Value | undefined
    // const model = await fetch(new Request('https://tfhub.dev/tensorflow/tfjs-model/tutorials/spam-detection/tfjs/1'))
    // console.log('model', model)
    this.value = stored || {
      toxicityModel: await this.loadModel()
    }
    console.log('init fin')

  }

  async fetch(request: Request) {
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
    console.log('awaiting init')
    await this.initializePromise;
    console.log('after init')
    const data = await request.json() as RequestBody
    return new Response(JSON.stringify(data))
    return new Response(JSON.stringify(await this.value.toxicityModel.classify(data.messages)))

  }


}