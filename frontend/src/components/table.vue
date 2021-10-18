<template>
  <div class="flex flex-col" v-if="tableData.length > 0">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th v-for="clasification in tableData[0].clasification" :key="clasification.label" scope="col" class="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{getLabel(clasification.label)}}
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time taken
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-center">
              <tr v-for="data in tableData" :key="data.message">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-lg text-gray">{{data.message}}</div>
                </td>
                <td v-for="clasification in data.clasification" :key="clasification.label" class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase" :class="getPillClasses(clasification)">
                    {{getMatchText(clasification.results[0].match)}}
                  </span>
                  <div class="text-sm text-gray-900">{{(clasification.results[0].probabilities[0] * 100).toFixed(3)}}</div>
                  <div class="text-xs text-gray-500">Percent match</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{data.time_taken}}</div>
                  <div class="text-xs text-gray-500">ms</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
    props: ['tableData'],
    setup () {
      const labelMap: {
        [key: string]: string
      } = {
        'identity_attack': 'Identity Attack',
        'insult': 'Insult',
        'obscene': 'Obscene',
        'severe_toxicity': 'Severe Toxicity',
        'sexual_explicit': 'Sexually Explicit',
        'threat': 'Threat',
        'toxicity': 'Toxicity'
      }
      function getPillClasses (
        clasification: {
          results: {
            match: boolean
          }[]
        }
      ) {
        return {
          'text-green-800': clasification.results[0].match === true,
          'bg-green-100': clasification.results[0].match === true,
          'text-red-800': clasification.results[0].match === false,
          'bg-red-100': clasification.results[0].match === false,
          'text-yellow-800': clasification.results[0].match === null,
          'bg-yellow-100': clasification.results[0].match === null
        }
      }
      function getMatchText (val: boolean): string {
        if (val === null) {
          return 'n/a'
        }
        return val.toString()
      }
      function getLabel (val: string) {
        if (labelMap[val] === undefined) {
          return val
        }
        return labelMap[val]
      }
      return {
        getLabel,
        getPillClasses,
        getMatchText
      }
    }
}
</script>