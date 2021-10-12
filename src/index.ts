// @ts-ignore
// In order for the workers runtime to find the class that implements
// our Durable Object namespace, we must export it from the root module.
export { TensorflowDurable } from './TensorflowDurable'

export default {
  async fetch(request: Request, env: Env) {
    try {
      if (request.method.toUpperCase() === 'GET') {
        return fetch(request)
      }
      if (request.method.toUpperCase() === 'OPTIONS') {
        const headers = new Headers()
        headers.set('content-type', 'application/json')
        headers.set("Access-Control-Allow-Origin",  "*")
        headers.set("Access-Control-Allow-Methods",  "GET,HEAD,POST,OPTIONS")
        headers.set("Access-Control-Max-Age",  "86400")
        headers.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
        return new Response('Ok', {
          headers
        })
      }
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
