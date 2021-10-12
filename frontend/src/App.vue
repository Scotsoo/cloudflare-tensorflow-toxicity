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
    let message: string = 'You suck!'
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
      message
    }
  }
}

</script>

<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <div>
    <input v-model="message"/>
    <button @click="doPost">Test</button>
    <div v-for="clasification in data.clasification" :key="clasification.label">
      <h3>{{clasification.label}}</h3>
      <span>{{clasification.results}}</span>
    </div>
    Data is: <br/>
    {{data}}
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
