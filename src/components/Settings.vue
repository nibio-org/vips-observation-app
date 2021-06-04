<template>
  <div class="container hello">
    <div class="row"><h1>{{ msg }}</h1></div>
    <div class="row">
     <router-link to="/cropCategory">Crop Category</router-link> 
    </div>

     <sync ref="sync"/>
     <div class="row">
        <button type="button" v-on:click="runSync" class="btn btn-outline-info">Sync</button>
     </div>
      <router-view/>
    </div>
</template>

<script>
import Sync from '@/components/Sync'
export default {
  components: { Sync },
  name: 'Settings',
  data () {
    return {
      msg: 'Innstillinger'
    }
  },
  methods : {
    runSync(){
      this.$refs.sync.syncTwoWay();
/*       this.$router.push("/").catch(()=>{});
      this.$router.go(); */
    },
  },
}
</script>