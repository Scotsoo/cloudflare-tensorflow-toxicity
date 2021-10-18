# Cloudflare Tensorflow Toxicity
## https://toxicity-api.com
Entry for the [Cloudflare Developer Summer Challenge](https://blog.cloudflare.com/developer-summer-challenge/)

### What is it?
It's a (relatively) fast, serverless, cpu backed tensorflow js [toxicity model](https://github.com/tensorflow/tfjs-models/tree/master/toxicity).

### What does it use in cloudflare?
- API
  - Workers
  - Durable Objects
- Frontend
  - Workers
  - Pages

### Motivation
You can see [here](https://storage.googleapis.com/tfjs-models/demos/toxicity/index.html) that loading the tfjs model in the browser is not very fluent. So loading the model at the edge, in the worlds largest CDN network seemed a great idea.

### Metrics
Super cold start (nothing in durable objects): 4000ms

Cold start (new edge worker, taking from durable objects): 1000ms

Hot instance (edge worker with model loaded in memory): 100ms (varies on sentence length/complexity)

### API Usage:
```bash
'curl https://toxicity-api.com/ -d \'{"messages": ["You Suck!"]}\' -XPOST | jq'
````
