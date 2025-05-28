<script setup lang="ts">
import { ref } from 'vue';
import NButton from './components/NButton.vue';

const count = ref(0);

</script>

<template>
  <div>
    <h3>Vite + Vue.js</h3>
  </div>
  <NButton type="submit" @click="() => count++">
    <span>In vue count : {{ count }}</span>
  </NButton>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
