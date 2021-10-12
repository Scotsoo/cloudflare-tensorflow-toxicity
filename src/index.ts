// @ts-ignore
// In order for the workers runtime to find the class that implements
// our Durable Object namespace, we must export it from the root module.
export { TensorflowDurable } from './TensorflowDurable'

export default {
  async fetch(request: Request, env: Env) {
    try {
      return await handleRequest(request, env)
    } catch (e) {
      return new Response(JSON.stringify(e))
    }
  },
}

async function handleRequest(request: Request, env: Env) {
  let id = env.TENSORFLOWDURABLE.idFromName('TENSORFLOW')
  let obj = env.TENSORFLOWDURABLE.get(id)
  let resp = await obj.fetch(request)
  return resp
}

interface Env {
  TENSORFLOWDURABLE: DurableObjectNamespace
}
