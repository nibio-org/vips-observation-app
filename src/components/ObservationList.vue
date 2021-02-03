<template>
  <div class="hello">
    <h1>{{ $t('startpage') }}</h1>
    <router-link to="/observation" custom v-slot="{navigate}">
      <button type="button" class="btn btn-primary" @click="navigate">+</button>
    </router-link>
    
    </div>
</template>

<script>
export default {
  name: 'ObservationList',
  data () {
    return {
      /*msg: 'Startsiden'*/
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
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