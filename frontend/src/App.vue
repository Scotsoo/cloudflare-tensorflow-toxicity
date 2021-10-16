<template>
  <div class="w-screen bg-gray-900 h-3/6">
    <input v-model="message"/>
    <button @click="doPost">Run!</button>
    <custom-table :tableData="data"/>
    <h4>Last time taken {{timeTaken}}ms</h4>
    <!-- <table>
      <thead>
        <td></td>
        <td v-for="clasification in data[0].clasification" :key="clasification.label">
          {{getLabel(clasification.label)}}
        </td>
      </thead>
      <tbody>
        <tr>
          <td>
            Is t/f:
          </td>
          <td v-for="clasification in data[0].clasification" :key="`${clasification.label}-row`">
            {{clasification.results[0].match}}
          </td>
        </tr>
        <tr>
          <td>
            Percent True:
          </td>
          <td v-for="clasification in data[0].clasification" :key="`${clasification.label}-t`">
            {{clasification.results[0].probabilities[1] * 100}}
          </td>
        </tr>
        <tr>
          <td>
            Percent False:
          </td>
          <td v-for="clasification in data[0].clasification" :key="`${clasification.label}-f`">
            {{clasification.results[0].probabilities[0] * 100}}
          </td>
        </tr>
      </tbody>
    </table> -->
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
    let message: string = 'You suck!'
    function getLabel (val: string) {
      if (labelMap[val] === undefined) {
        return val
      }
      return labelMap[val]
    }
    async function doPost () {
      const n = Date.now()
      const message = this?.message ?? 'You Suck!'
      const d = await axios.post<{}>('https://toxicity.scotsoo.me/', {
        // @ts-ignore
        messages: message
      })
      // @ts-ignore
      console.log('data', d)
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
    await this.doPost()
  }
}

</script>

<style>

</style>
