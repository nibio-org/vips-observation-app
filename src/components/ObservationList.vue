<template>
<div>
  <div class="hello" v-if="isLoggedIn" >
    <h1>{{ $t("startpage") }}</h1>
    <router-link to="/observation" custom v-slot="{ navigate }">
      <button type="button" class="btn btn-primary" @click="navigate">+</button>
    </router-link>  
  </div>
  <div v-else>
    <Welcome/>

  </div>
</div>
</template>

<script>
import Welcome from '@/components/Welcome'
export default {
  name: "ObservationList",
  data() {
    return {
      /*msg: 'Startsiden'*/
      isLoggedIn: true,
    };
  },
  components: {
    Welcome,
  },
  methods: {
    funCheckUUID() {
      if(this.$root.sharedState.uuid != '')
      {
        this.isLoggedIn = false;
      }
      else{
        this.isLoggedIn = true;
      }
      //this.isUUID = this.$root.sharedState.uuid;
      
      
    },
  },
  mounted() {
    console.log('Mounted!');
    this.funCheckUUID();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>