<template>
  <section class="home section" id="home">
    <div class="home__container">
      <div class="home__content">
        <MyOfficeScene></MyOfficeScene>
      </div>
    </div>
  </section>
</template>

<script>
import MyOfficeScene from '@/components/MyOfficeScene.vue'
export default {
  name: 'AppHome',
  components: {
    MyOfficeScene,
  },
}
</script>

<style lang="scss" scoped>
.home {
  &__container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__three {
    width: 100%;
    height: 100%;
  }
}
</style>
