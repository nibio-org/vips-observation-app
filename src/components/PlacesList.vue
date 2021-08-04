<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
      <div >
          <router-link  class="row fw-bold" ref='linkMapPoi' :to="{name:'MapPOI', params: {}}"  >
                <div class='col'><i class="fas fa-plus-circle fa-2x"></i></div>
          </router-link>
    </div>  
    <div class="container">
          <div class="row">
              <div> {{ $t('prop.places.search.label') }} &nbsp;</div> <div><input type="text" v-model.trim="textSearch" @input="search"> </div>
          </div>
          <br>
            <router-link  class="row fw-bold" ref='linkMapPoi' :to="{name:'MapPOI', params: {pointOfInterestId:poi.pointOfInterestId}}" v-bind:class="{'text-danger':poi.isNew, 'text-primary':poi.toUpload, 'text-secondary':poi.isDeleted}"  v-for="poi in listPOI" v-bind:key="poi.pointOfInterestId">
                <div v-if="poi.isDeleted">
                    <strike> <div ><h5>{{poi.name}}</h5></div> </strike>
                </div>
                <div v-else>
                    <div ><h5>{{poi.name}}</h5></div>                
                </div>
                
            </router-link>
          <div class="clearfix" />
    </div>
    <div id='divNewPOI' class="container">
          <router-link  class="row fw-bold" ref='linkMapPoi' :to="{name:'MapPOI', params: {}}"  >
                <div class='col-10 '></div>
                <div class='col'><i class="fas fa-plus-circle fa-2x"></i></div>
          </router-link>
    </div>
   

    <common-util ref="CommonUtil"/>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'



export default {
  name: 'PlacesList',
  components  :   {CommonUtil},
  data () {
    return {
      msg               : 'Mine steder',
      CONST_URL_DOMAIN  : '',
      listPOI           : [],
      textSearch        : null,
    }
  },

  
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
                getPlacesList(lstPOI)
                {
                                lstPOI.forEach(function(poi){
                                    if(poi.uploaded===false)
                                    {
                                      if(poi.deleted)
                                      {
                                          poi.isDeleted = true;
                                      }
                                      else{
                                            if(poi.pointOfInterestId < 0)
                                            {
                                              poi.isNew = true;
                                            }
                                            else{
                                              poi.toUpload = true;
                                            }
                                      }

                                    }

                                });                  
                  return lstPOI;
                },

                search()
                {
                  let lstPOI = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                  if(this.textSearch)
                    {
                      let This = this;
                     
                      let lstPOISearch            = lstPOI.filter(function (poi){
                                                        let poiName = poi.name;
                                                        return poiName.indexOf(This.textSearch) != -1;
                                                    });
                      this.listPOI  = this.getPlacesList(lstPOISearch)
                    }                  
                  else
                  {
                    this.listPOI  = this.getPlacesList(lstPOI);
                  }
                }

    },
    mounted() {
            this.CONST_URL_DOMAIN = CommonUtil.CONST_URL_DOMAIN;
            /** TODO fetch server should be used in sync process and not here */
            //this.fetchFromServer();
            let lstPOI = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
            this.listPOI  = this.getPlacesList(lstPOI);

    }  
}
</script>
<style scoped>
a {
  color: #42b983;
}

  #divNewPOI {
    position: fixed; 
    bottom : 0;
  }
</style>
