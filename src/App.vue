<template>
    <main id="app" role="main" class="container">
    <div v-if="$root.sharedState.uuid">
      <router-view/>
    </div>
    <div v-else>
      <Welcome></Welcome>
    </div>
  </main>
</template>

<script>
import Welcome from '@/components/Welcome'
import CommonUtil from "@/components/CommonUtil";

export default {
  name: 'App',
  components : {
    Welcome
  },
  methods: {
	},
  mounted(){
    
    let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
    this.$root.sharedState.uuid = userUUID;

  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  margin-top: 60px;
}
</style>
