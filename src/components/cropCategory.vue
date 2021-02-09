
<template>
  <div id="divCropCategory">
    <h1>Crop Category List</h1>
    <li v-for="item in listCropCategoris">
      {{ item.defaultName }}
    </li>
  </div>
</template>

<script>
export default {
  name: "cropCategory",
  data: {
    listCropCategoris: []
    //return listCropCategoris;
  },
  methods: {
    funFetchCropCategory(organizationId) {
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