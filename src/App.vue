<template>
  <div id="app">
    <h1 v-if="!$route">Router not working</h1>
    <router-view v-else />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    console.log('App mounted, route:', this.$route)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>