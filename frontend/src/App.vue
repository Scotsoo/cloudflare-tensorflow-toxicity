<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <div>
    <div class="header">
      <div class="vertical-center">
        <h1>Toxicity API</h1>
        <h4>WIP</h4>
      </div>
    </div>
    <div class="centered">
      <input v-model="message"/>
      <button @click="doPost">Test</button>
      <table>
        <thead>
          <td></td>
          <td v-for="clasification in data.clasification" :key="clasification.label">
            {{getLabel(clasification.label)}}
          </td>
        </thead>
        <tbody>
          <tr>
            <td>
              Is t/f:
            </td>
            <td v-for="clasification in data.clasification" :key="`${clasification.label}-row`">
              {{clasification.results[0].match}}
            </td>
          </tr>
          <tr>
            <td>
              Percent True:
            </td>
            <td v-for="clasification in data.clasification" :key="`${clasification.label}-t`">
              {{clasification.results[0].probabilities[1] * 100}}
            </td>
          </tr>
          <tr>
            <td>
              Percent False:
            </td>
            <td v-for="clasification in data.clasification" :key="`${clasification.label}-f`">
              {{clasification.results[0].probabilities[0] * 100}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div v-for="clasification in data.clasification" :key="clasification.label">
      <h3>{{getLabel(clasification.label)}}</h3>
      <span>{{clasification.results}}</span>
    </div>
    Data is: <br/>
    {{data}} -->
  </div>
</template>
<script lang="ts">
import { Ref, ref } from 'vue'

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import axios from 'axios'
export default {
  setup () {
    // @ts-ignore
    let data: Ref<{
      clasification: any[]
    }> = ref({
      clasification: []
    })
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
    let message: string = 'You suck!'
    function getLabel (val: string) {
      if (labelMap[val] === undefined) {
        return val
      }
      return labelMap[val]
    }
    async function doPost () {
      const d = await axios.post<{}>('https://toxicity.scotsoo.me/', {
        // @ts-ignore
        messages: this.message
      })
      console.log('data', d)
      // @ts-ignore
      this.data = d.data
    }
    return {
      data, doPost,
      message, labelMap, getLabel
    }
  }
}

</script>


<style>
body {
  margin: 0;
  padding: 0;
  text-align: center;
}
.vertical-center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  text-align: center;
  width: 100%;
}
table {
  margin-left: auto;
  margin-right: auto;
  padding-top: 10px;
}
td {
  padding-left: 1rem;
}
#app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.header {
  color: white;
  position: relative;
  background-color: black;
  width: 100%;
  height: 30vh;
}
</style>
