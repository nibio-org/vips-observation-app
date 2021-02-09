<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
     <router-link to="/cropCategory">Crop Category</router-link> 
      <router-view/>
    </div>
</template>

<script>
export default {
  name: 'Settings',
  data () {
    return {
      msg: 'Innstillinger'
    }
  }
}
</script>