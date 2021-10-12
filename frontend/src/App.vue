<script setup lang="ts">
import { ref } from 'vue'

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios'
async function doPost () {
  const data = await axios.post('https://toxicity.scotsoo.me/', {
    messages: 'you suck!'
  })
  console.log('data', data)
}
const data = ref(0)
</script>

<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <button @click="doPost">Test</button>
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
