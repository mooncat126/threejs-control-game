<template>
  <main class="main">
    <AppHome></AppHome>
  </main>
</template>

<script>
import AppHome from './components/AppHome.vue';
export default {
  name: 'App',
  components: {
    AppHome,
  }
}
</script>

<style lang="scss">
@import "@/styles/index.scss";
</style>
