
<template>
  <div id="divCropCategory">
    <h1>Crop Category List</h1>
    <ul class="list-group" style="text-align: left">
      <li class="list-group-item" v-for="item in listCropCategoris">
        <input
          
          type="checkbox"
          v-bind:value="item.cropCategoryId"
          v-model="listSelectedIds"
          v-on:click="funSaveCategoryId()"
        />
        {{ item.defaultName }}
      </li>
    </ul>
    <span>Checked names: {{ listSelectedIds }}</span>
  </div>
</template>

<script>
export default {
  name: "cropCategory",
  data() {
    return {
      listSelectedIds: [],
      listCropCategoris: [],
    };
  },
  watch: {
    listSelectedIds: function (val) {
      localStorage.setItem("cropIds", this.listSelectedIds);
    },
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
      )
        .then((response) => response.json())
        .then((data) => {
          this.listCropCategoris = data;
        });
      //   })
    },
    funSaveCategoryId: function () {
      //if (event.target.checked)

      //localStorage.cropIds=this.listSelectedIds;
      localStorage.setItem("cropIds", this.listSelectedIds);
    },
  },
  created() {
    //localStorage.removeItem('cropIds');
    this.funFetchCropCategory(1);
    if (
      null != localStorage.getItem("cropIds") &&
      localStorage.getItem("cropIds") != "" &&
      typeof localStorage.getItem("cropIds") != "undefined"
    ) {
      this.listSelectedIds = localStorage.getItem("cropIds").split(",");
    }
  },
};
</script>

<style  scoped>
.custom-checkbox .custom-control-input:checked~.custom-control-label::before{
  background-color:green;
}
</style>