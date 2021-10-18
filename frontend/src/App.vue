<template>
  <div>
    <div class="w-screen bg-gray-900 sm:h-1/6 lg:h-3/6 lg:min-h-1/3vh sm:min-h-1/4vh flex">
      <div class="m-auto text-center">
        <h1 class="sm:text-4xl lg:text-9xl uppercase bold text-gray-100">Toxicity API</h1>
        <h3 class="sm:text-l lg:text-4xl uppercase bold text-gray-100">
          Cloudflare Worker Tensorflow Toxicity API
        </h3>
      </div>
    </div>

    <div class="flex pb-3 pt-3">
        <div class="m-auto">
          <input v-model="message" v-on:keyup.enter="doPost()" class="w-100 text-4xl shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="tryitout" type="text" placeholder="Try it out!">
        </div>
      <br/>
    </div>
    <div class="flex">
      <div class="m-auto h-auto lg:w-10/12 md:w-100">
        <custom-table :tableData="data"/>
      </div>
    </div>
  </div>

</template>
<script lang="ts">
import { Ref, ref } from 'vue'
import axios from 'axios'
import customTable from './components/table.vue'
export default {
  components: {customTable},
  setup () {
    // @ts-ignore
    let data: Ref<{
      clasification?: any[]
    }[]> = ref([])
    const labelMap: {
      [key: string]: string
    } = {
      'identity_attack': 'Identity Attack',
      'insult': 'Insult',
      'obscene': 'Obscene',
      'severe_toxicity': 'Severe Toxicity',
      'sexual_explicit': 'Sexually Explicit',
      'threat': 'Threat',
      'toxicity': 'Toxicity',
      'time_taken': 'Time Taken'
    }
    let message: string = ''
    function getLabel (val: string) {
      if (labelMap[val] === undefined) {
        return val
      }
      return labelMap[val]
    }
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
        // @ts-ignore
        messages: message
      })
      // @ts-ignore
      d.data.time_taken = Date.now() - n
      d.data.message = message
      // @ts-ignore
      this.data.push(d.data)
    }
    return {
      data, doPost,
      message, labelMap, getLabel
    }
  },
  async mounted () {
    // @ts-ignore
    await this.doPost('You Suck!')
  }
}

</script>

<style>

</style>
