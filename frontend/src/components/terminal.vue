<template>
 <div class="min-w-full sw-full">
  <div class="coding inverse-toggle px-5 pt-4 shadow-lg text-gray-100 text-sm font-mono subpixel-antialiased
    bg-console  pb-6 rounded-lg leading-normal overflow-hidden">
    <div class="top mb-2 flex">
      <div class="h-3 w-3 bg-red-500 rounded-full"></div>
      <div class="ml-2 h-3 w-3 bg-yellow-500 rounded-full"></div>
      <div class="ml-2 h-3 w-3 bg-green-500 rounded-full"></div>
    </div>
    <div class="min-h-1/3vh max-h-1/3vh overflow-y-auto" id="scroller">
      <p v-for="(msg, idx) in messages" :key="`msg-${idx}`" class="flex-1 typing items-center pl-2 whitespace-pre">
        {{msg}}
      </p>
    </div>
    <div class="mt-4 flex">
      <span class="text-green-400">toxicity:~$</span>
      <p class="flex-0 typing items-center pl-2 w-auto">
        {{message}}
      </p>
        <div class="bg-gray-300 h-100 w-1 ml-1"></div>
        <br>
    </div>
  </div>
</div>
</template>
<script lang="ts">
import { Ref, ref } from 'vue'
export default {
  setup () {
    let message = ref('')
    let messages: Ref<string[]> = ref([])
    async function startTyping() {
      this.messages = []
      this.message = ''
      const writeMessage = async (msg: string) =>{
        this.message = ''
        let idx = 0
        const len = msg.length
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            this.message += msg[idx++]
            if (idx === len) {
              clearInterval(interval)
              return resolve()
            }
          }, 60)
        })
      }
      let fullMessage =  'curl https://toxicity-api.com/ -d \'{"messages": ["You Suck!"]}\' -XPOST | jq'
      await writeMessage(fullMessage)
      const curlOutput = [
        '% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current Dload  Upload   Total   Spent    Left  Speed',
        '100   855  100   828  100    27   1788     58 --:--:-- --:--:-- --:--:--  1846'
      ]
      this.messages.push(this.message)
      this.messages.push(...curlOutput)
      this.message = ''
      await new Promise(resolve => {
        setTimeout(() => {
          return resolve()
        }, 500)
      })
      const data = ['{',
      '  "clasification": [',
      '    {',
      '      "label": "identity_attack",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.8524117469787598,',
      '            "1": 0.14758820831775665',
      '          },',
      '          "match": false',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "insult",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.22212164103984833,',
      '            "1": 0.7778783440589905',
      '          },',
      '          "match": true',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "obscene",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.2495148479938507,',
      '            "1": 0.7504851818084717',
      '          },',
      '          "match": true',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "severe_toxicity",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.9894346594810486,',
      '            "1": 0.010565368458628654',
      '          },',
      '          "match": false',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "sexual_explicit",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.669723391532898,',
      '            "1": 0.33027657866477966',
      '          },',
      '          "match": null',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "threat",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.7760032415390015,',
      '            "1": 0.22399677336215973',
      '          },',
      '          "match": false',
      '        }',
      '      ]',
      '    },',
      '    {',
      '      "label": "toxicity",',
      '      "results": [',
      '        {',
      '          "probabilities": {',
      '            "0": 0.04700278490781784,',
      '            "1": 0.9529971480369568',
      '          },',
      '          "match": true',
      '        }',
      '      ]',
      '    }',
      '  ]',
      '}',
      ]
      const elem = document.getElementById('scroller')
      for (const d of data) {
        await new Promise((resolve) => [
          setTimeout(() => {
            this.messages.push(d)
            elem.scrollTop = elem.scrollHeight;
            return resolve()
          }, 20)
        ])
      }
      await writeMessage('☣️☠️☣️☠️☣️☠️☣️☠️☣️')
      await new Promise(resolve => {
        setTimeout(() => {
          return resolve()
        }, 10000)
      })
      return startTyping.bind(this)()
    }
    return {
      message,
      startTyping,
      messages
    }
  },
  mounted () {
    this.startTyping()
  }
}
</script>
