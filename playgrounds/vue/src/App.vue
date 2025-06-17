<script setup lang="ts">
import { ref } from 'vue';
import NButton from './components/NButton.vue';

const count = ref(0);

const handleClick = (e: any) => {
  console.log('Button clicked', e.detail);
  count.value++;
};

const handleEvent = (e: any) => {
  console.log('Event triggered:', e.detail);
};

</script>

<template>
  <div>
    <h3>Vite + Vue.js</h3>
  </div>
  <p>{{ count }}</p>
  <button @click="count++">Increment Count</button>
  <div>
    <NButton type="submit" @on-click="handleClick" @on-event="handleEvent">
      <span>In vue count : {{ count }}</span>
    </NButton>
  </div>
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
