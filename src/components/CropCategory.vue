
<template>
  <div id="divCropCategory">
    <h1>Crop Category List</h1>
    <div v-show="isCropIdsNotAvailable"  class="alert alert-warning" role="alert">
      {{ $t("prop.crop.category.empty.alert") }}
    </div>
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
    <!-- <span>Checked names: {{ listSelectedIds }}</span> -->
  </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
export default {
  name: "cropCategory",
  data() {
    return {
      isCropIdsNotAvailable       : true,
      listSelectedIds: [],
      listCropCategoris: [],
    };
  },
  watch: {
    listSelectedIds: function (newVal,val) {
      localStorage.setItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST, this.listSelectedIds);

    },
  },
  methods: {
    /** Save crop category  */
    funSaveCategoryId: function () {
      localStorage.setItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST, this.listSelectedIds);
      let localListSelectedIds = localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST).split(",");


       if(localListSelectedIds.length < 0)
      {
        this.isCropIdsNotAvailable = true;
      }
      else
      {
         this.isCropIdsNotAvailable = false;
      } 
    },
  },
  mounted() {
    
    if(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY) )
    {
      this.listCropCategoris = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY));
    }

  if (
      null != localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST) &&
      localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST) != "" &&
      typeof localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST) != "undefined"
    ) {
      this.listSelectedIds = localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST).split(",");
      if((this.listSelectedIds).length > 0)
      {
        this.isCropIdsNotAvailable = false;
      }
    }

 


  },
};
</script>

<style  scoped>
.custom-checkbox .custom-control-input:checked~.custom-control-label::before{
  background-color:green;
}
</style>