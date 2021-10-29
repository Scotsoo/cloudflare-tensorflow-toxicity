<template>
  <div>
    <div class="w-screen bg-gray-900 sm:h-1/6 lg:h-2/5 lg:min-h-2/5vh sm:min-h-1/4vh flex">
      <div class="m-auto text-center">
        <h1 class="sm:text-4xl lg:text-9xl uppercase bold text-gray-100">Toxicity API</h1>
        <h3 class="sm:text-l lg:text-4xl bold text-gray-100">
          cloudflare worker tfjs
        </h3>
      </div>
    </div>
    <div class="flex pb-5 pt-5">
      <div class="m-auto">
        <input v-model="message" v-on:keyup.enter="doPost()" class="w-100 text-4xl shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="tryitout" type="text" placeholder="TRY IT YOURSELF">
      </div>
    </div>
    <div class="flex">
      <div class="m-auto h-auto w-10/12">
        <custom-table :tableData="data"/>
      </div>
    </div>
    <div class="flex pt-20 pb-10">
      <div class="h-auto w-full px-3">
        <h2 class="text-white sm:text-xl lg:text-3xl pb-3">Usage:</h2>
        <terminal-demo/>
      </div>
    </div>
    <div class="flex">
      <p class="text-white m-auto pb-3">
        made with 💗 on <a class="underline" href="https://www.cloudflare.com/">cloudflare</a> by <a class="underline" href="https://github.com/scotsoo">scotsoo</a> & <a class="underline" href="https://github.com/whiteh">whiteh</a>. <a class="underline" href="https://github.com/Scotsoo/cloudflare-tensorflow-toxicity">GITHUB</a>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { Ref, ref } from 'vue'
import axios from 'axios'
import customTable from './components/table.vue'
import terminalDemo from './components/terminal.vue'
export default {
  components: {customTable, terminalDemo},
  setup () {
    // @ts-ignore
    let data: Ref<{
      clasification?: any[]
    }[]> = ref([])
    let message: string = ''

    // @ts-ignore
    async function doPost (message?: string) {
      const n = Date.now()
      // @ts-ignore
      message = message || this?.message
      if (message === undefined || message.length === 0) {
        return
      }
      const d = await axios.post<{
        time_taken: number
        message: string
      }>('https://toxicity-api.com/', {
        messages: message
      })
      // @ts-ignore
      d.data.time_taken = Date.now() - n
      d.data.message = message
      // @ts-ignore
      this.data.unshift(d.data)
      // @ts-ignore
      if (this.data.length > 4) {
        // @ts-ignore
        this.data.pop()
      }
    }
    return {
      data, doPost,
      message
    }
  },
  async mounted () {
    // @ts-ignore
    await this.doPost('You Suck!')
    // @ts-ignore
    await this.doPost('Please stop. If you continue to vandalize Wikipedia, as you did to Kmart, you will be blocked from editing.')
  }
}

</script>

<style>

</style>
