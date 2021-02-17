<template>
  <main id="app" role="main" class="container">
    <!-- <login-system v-on:eventloginuserdetail="welcomevips" style='display:none'></login-system> -->
   
    <div v-if="sharedState.uuid != '' ">
      <Welcome></Welcome>
    </div>
    <div v-else>
      <router-view/>
    </div>
  </main>
</template>

<script>
import Welcome from '@/components/Welcome'
import LoginSystem from '@/components/LoginSystem'
export default {
  name: 'App',
  components : {
    Welcome,
    LoginSystem
  },
  data() {
          //sharedState : store.state
         return { sharedState : {uuid:''} }
	},
  methods : {
    welcomevips(uuid)
    {
      console.log ('App - welcomevips')
        this.sharedState.uuid = uuid;
    }
  },
  created()
  {
    console.log('App - created');
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
