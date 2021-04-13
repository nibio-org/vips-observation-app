<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <ul class="list-group">
        <li v-for="poi in listPOI" v-bind:key="poi.pointOfInterestId" class="list-group-item d-flex justify-content-between align-items-start" >
            <div class="fw-bold">{{poi.name}}</div>
            <span><i class="fas fa-plus-circle fa-2x"></i> </span>
          </li>
    </ul>
    <common-util ref="CommonUtil"/>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'



export default {
  name: 'PlacesList',
  data () {
    return {
      msg               : 'Mine steder',
      CONST_URL_DOMAIN  : '',
      listPOI           : [],
    }
  },
  components  :   {CommonUtil},
    methods : {
                fetchFromServer()
                {
                    let strUUID     = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
                    let jsonHeader  = { Authorization: strUUID };

                    fetch(this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_USER_POI, {
                        method: "GET",
                        headers: jsonHeader,
                    }).then((response) => response.json())
                        .then((data) => { 
                        localStorage.setItem(CommonUtil.CONST_STORAGE_POI_LIST,JSON.stringify(data));
                        //this.getObservationsFromStore();
                        })

                },
                getPlacesList()
                {
                  let lstPOI = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                  return lstPOI;
                }

    },
    mounted() {
            this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
            /** TODO fetch server should be used in sync process and not here */
            //this.fetchFromServer();

            this.listPOI  = this.getPlacesList();

    }  
}
</script>
