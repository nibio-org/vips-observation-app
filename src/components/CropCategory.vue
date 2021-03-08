
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
import CommonUtil from '@/components/CommonUtil'
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
      localStorage.setItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST, this.listSelectedIds);
    },
  },
  methods: {
    funSaveCategoryId: function () {
      localStorage.setItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST, this.listSelectedIds);
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
    }
  },
};
</script>

<style  scoped>
.custom-checkbox .custom-control-input:checked~.custom-control-label::before{
  background-color:green;
}
</style>