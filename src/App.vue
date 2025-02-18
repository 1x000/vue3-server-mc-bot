<template>
  <div class="app-container">
    <h1 class="app-title">3C3U-BOT</h1>
    <minecraft-monitor />
  </div>
</template>

<script>
import MinecraftMonitor from './components/MinecraftMonitor.vue';

export default {
  name: 'App',
  components: {
    MinecraftMonitor
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background-color: #f0f0f0;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
</style>
