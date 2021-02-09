
<template>
  <div id="divCropCategory">
    <h1>Crop Category List</h1>
    <li v-for="item in listCropCategoris">
      <input type="checkbox" v-bind:value='item.cropCategoryId' v-model="listSelectedCropCategoris"> {{ item.defaultName }}
    </li>
    <span>Checked names: {{ listSelectedCropCategoris }}</span>
  </div>
</template>

<script>
export default {
  name: "cropCategory",
  data() {
    {listSelectedCropCategoris : []};
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
  },
  mounted()
  {
      this.funFetchCropCategory(1);
  }
};
</script>

<style  scoped>
</style>