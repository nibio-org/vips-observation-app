
<template>
  <div id="divCropCategory">
    <h1>Crop Category List</h1>
    <li v-for="item in listCropCategoris">
      <input type="checkbox" v-bind:value='item.cropCategoryId' v-model="listSelectedCropCategoris" v-on:click="funSaveCategoryId()"> {{ item.defaultName }}
    </li>
    <span>Checked names: {{ listSelectedCropCategoris }}</span>
  </div>
</template>

<script>
export default {
  name: "cropCategory",
  data() {

    return {
      listSelectedCropCategoris:[],
      listCropCategoris: []
      }

  },
  methods: {
    funFetchCropCategory(organizationId) {
//        this.$nextTick(function () {
      fetch(
        "https://logic.vips.nibio.no/rest/organism/cropcategory/" +
          organizationId
          
/*           ,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            
          },
        } */
      ).then(response => response.json())
      .then((data) => {
        this.listCropCategoris = data;
      });
 //   })
    },
    funSaveCategoryId : function(){
    //if (event.target.checked) 
        
      localStorage.cropIds=this.listSelectedCropCategoris;
      console.log('before store : '+this.listSelectedCropCategoris);
      console.log('localstorage 1: '+localStorage.cropIds);
      console.log('localstorage 2: '+localStorage.getItem('cropIds'));
    },

  },
  created()
  {
      this.funFetchCropCategory(1);
      console.log('localstorage 3: '+localStorage.getItem('cropIds'));
/*
      if( 
                (null != localStorage.getItem('cropIds')) 
            &&  (localStorage.getItem('cropIds') != '')
            &&  (typeof(localStorage.getItem('cropIds'))!= undefined)
                )
            {
                this.listSelectedCropCategoris  = localStorage.getItem('cropIds');
            }
  */    
  }
};


</script>

<style  scoped>
</style>