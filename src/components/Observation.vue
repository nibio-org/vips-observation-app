<template>
  <div class="hello">
    <h1 ref='titleObservation'>{{ msg }}</h1>
    
    <br>

    <select id="divCropId" ref='divCropId' v-model="crop.cropId" v-on:change="selectCrop($event)">
        <option v-for="crop in crops" v-bind:value='crop.organismId' >{{crop.latinName}}</option>
    </select>
    <br>
      <div class="clearfix"/>
    <select  v-model="pest.pestId" id='divPestId' ref='divPestId'>
        <option v-for="pest in pests" v-bind:value='pest.pestId'>{{pest.pestName}}</option>
    </select>

    <div class="clearfix"/>
    <div ref='divDateTime'>
      <!-- <input type="datetime-local" v-bind='strDateObservation | dateFormat' v-model="strDateObservation"/> -->
        <input type="datetime-local" v-model="strDateObservation" />
    </div>
    <router-link id="linkMap" ref='linkMap' :to="{name:'MapObservation', params: {observationId:observationId,geoinfo:mapGeoinfo,isMapPanelVisible:newMapPanel,locationPointOfInterestId:mapLocationPointOfInterestId}}">Observation Map </router-link>
      <div v-if="mapGeoinfo" id="divMapGeoInfo"><div v-if="isMounted"><map-observation :geoinfo="mapGeoinfo" :isMapPanelVisible="isMapPanelVisible" :locationIsPrivate="observation.locationIsPrivate" :polygonService="observation.polygonService" v-on:visibilityObservationAction="visibilityObservationAction"></map-observation></div></div> 

     <photo :isImageVisible=false :observationId="observationId" :organismId="observation.organismId" ></photo>
      <photo :isImageVisible=true :observationId="observation.observationId" :organismId="observation.organismId" :imageFileName="photo.observationIllustrationPK.fileName" :isDeleted='photo.deleted' v-for="photo in observation.observationIllustrationSet" v-bind:key="photo.observationIllustrationPK.fileName"></photo>
      <!-- <photo-observation :observationId="observation.observationId" :organismId="observation.organismId" :imageFileName="photo.observationIllustrationPK.fileName" v-for="photo in observation.observationIllustrationSet" v-bind:key="photo.observationIllustrationPK.fileName"></photo-observation> -->
      
      <div class="clearfix"/>

      <button class="btn btn-success" v-on:click="showQuantification"><span><h5>Tell/kvantifiser</h5></span></button>
      <div v-if="isQuantification">
          <div v-if="isMounted" id='divSchemaForm' class="border border-primary rounded" >
              <button id="btnCloseQuantification" class="border border-primary rounded-circle" type="button" v-on:click="closeQuantification">x</button>              
              <!-- <router-link :to="{name: 'Quantification', params: {observationId:observation.observationId, organismId:observation.organismId, schemaData:observation.observationData}}" >Tell/kvantifiser</router-link> -->
              
              <quantification :isEditable="false" :observationId="observation.observationId" :organismId="observation.organismId" :schemaData="observation.observationData" v-on:updateQuntificationData="updateQuntificationData"> </quantification>
          </div>
      </div>
      <div ref='divObservationText'>
        <div>Observation Detail</div>
        <input type="text" v-model="observationHeader"/>
        <p><textarea v-model="observationText" /></p>
      </div>
      
        <button class="btn btn-secondary float-right" v-on:click="saveObservation">Save</button>
     
  </div>  
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import { DateTime } from 'luxon'
import MapObservation from '@/components/MapObservation'
import PhotoObservation from '@/components/PhotoObservation'
import Photo from '@/components/Photo.vue'
import Quantification from '@/components/Quantification.vue'



export default {
  name: 'Observation',
  props: ['observationId'],
  components: {MapObservation,PhotoObservation,Photo,Quantification},
  data () {
    return {
      isQuantification : false,
      isMounted : false,
      msg: 'Observasjon',
      observation:{},
      crops:[],
      pests:[],
      crop:{'cropId':'','cropName':'Select Crop'},
      pest:{'pestId':'','pestName':'Select Pest'},
      isActive : false,
      dateObservation : DateTime,
      strDateObservation:'',
      observationHeader : '',
      observationText : '',
      mapGeoinfo:'',
      mapLocationPointOfInterestId:'',
      isMapPanelVisible:false,
      newMapPanel:true,
      observationForStore : 
      {
        observationId: '',
        timeOfObservation: '',
        statusChangedTime: '',
        organismId: '',
        cropOrganismId: '',
        observationHeading: '',
        observationText: '',
        uploaded:false        
      },
    }
  },
  methods:{
    visibilityObservationAction(paramPrivate, paramPolygonService){
       this.observationForStore.locationIsPrivate=paramPrivate;
       if(paramPolygonService)
       {
         this.observationForStore.polygonService=paramPolygonService;
       }
       else{
         this.observationForStore.polygonService='';
       }
    },
    showQuantification()
    {
        this.isQuantification = true;
    },
    closeQuantification(){
      this.isQuantification = false;
    },
    /** Get observation from local storage system */
    getObservationFromStore(id)
    {
        // For existing observation
        if(id)
        {
              
              let jsonObservation = {};
              
              let lstObservations     = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));              // Observation List
              jsonObservation         = lstObservations.find(({observationId})=> observationId === id);                           // Selection Observation
              this.observation        = jsonObservation;
              
/*              
              let lastQuoteRemoved    = this.observation.observationData.slice(0,0);
              console.log(lastQuoteRemoved);
              this.observation.observationData = lastQuoteRemoved.slice(0,0);
              console.log(this.observation.observationData);
*/
              /* For related Crop and Crop list */
              this.getObservationCrops(jsonObservation);
              /* For related Pest and Pest list */
              this.getObservationPests(jsonObservation);

              this.strDateObservation = DateTime.fromISO(jsonObservation.timeOfObservation).toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

              this.observationHeader  =  jsonObservation.observationHeading;
              this.observationText    =   jsonObservation.observationText;

              if(jsonObservation.geoinfo)
              {
                this.mapGeoinfo            =   JSON.parse(jsonObservation.geoinfo);
              }
              else
              {
                
                if(jsonObservation.location && jsonObservation.location.geoJSON)
                {
                   this.mapGeoinfo                      =   JSON.parse(jsonObservation.location.geoJSON);
                   this.mapLocationPointOfInterestId    =   jsonObservation.locationPointOfInterestId;
                }
              }
          }
          else {
            //TODO for new Observation
          }  
      },

      /** Get related crop and crop list for a selected Observation */
      getObservationCrops(jsonObservation){
              let lstCrops        = [];
              let lstCropIds      = [];
              let lstCropList     = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_LIST));

              /** Try to get list of crops from crop category ids */
              let lstCropCategories = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY));
              //let testCropIds = lstObservations.find(({cropOrganismIds})=> cropOrganismIds === this.observation.cropOrganismId);

            /** For Selected Observation We require List of related crop ids for dropdown   */
            // Iterating crop categories
            $.each(lstCropCategories, function(index,category){
                // Iterating each category data
                $.each(category, function(key, data){
                  //find the key meant for crop id/ids
                  if(key === 'cropOrganismIds')
                  {
                    this.isActive = true;
                    // iterate and get the required cropids relaed to selected observation id
                      $.each (data, function(index, item){
                          if(item===jsonObservation.cropOrganismId)
                          {
                            lstCropIds = data;
                            return false;
                          }
                      });
                  }
                })
              });

            /* Get list of related crops with their id and name */
            this.getCrops(lstCropIds);

              let jsonSelectedCrop= this.crops.find(({organismId}) => organismId === jsonObservation.cropOrganismId);
            //  this.crops = lstCrops;
              if(jsonSelectedCrop)
              {
                this.crop = {"cropId":jsonSelectedCrop.organismId, "cropName":jsonSelectedCrop.latinName};
              }
      },

      /** Get related pests for a particular crop of a observation */
      getObservationPests(jsonObservation){
            let lstPests            = [];
            let lstPestIds          = [];
            let lstPestList         = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_PEST_LIST));
            let lstCropPestList     = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_PEST_LIST));
 
             $.each(lstCropPestList, function(index,cropPests){
                if(cropPests.cropOrganismId === jsonObservation.cropOrganismId)
                {
                    lstPestIds = cropPests.pestOrganismIds;
                }
                
            }); 
            
            this.getPests(lstPestIds);

            let jsonSelectedPest = this.pests.find(({pestId}) => pestId === jsonObservation.organismId);
            if(jsonSelectedPest)
            {
              this.pest = {"pestId":jsonSelectedPest.pestId, "pestName":jsonSelectedPest.pestName};
            }


      },

      /** On selecting a particular crop */
      selectCrop(event)
      {
          let crop = this.crop;
          let lstPestIds              = [];
          let lstCropPestList         = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_PEST_LIST));
            $.each(lstCropPestList, function(cropId, cropPest){ 

                  if(crop.cropId === cropPest.cropOrganismId) 
                  {
                    let jsonPestId = cropPest.pestOrganismIds;
                    lstPestIds = lstPestIds.concat(jsonPestId);
                  }
            });
            this.getPests(lstPestIds);   

         
      },

      
      /** Get New Observation  */
      getNewObservation()
      {   let lstCropIds              = [];
          //let lstPestIds              = [];
          let cropCategoryIdProp      = CommonUtil.CONST_CROP_CATEGORY_ID; 
          let jsonCrops               = [];
          let arrCropCatIds           = localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST).split(",");
          let jsonCropCategoryList    = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY));
          //let lstCropPestList         = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_PEST_LIST));


          /* Iterate Selected Crop Ids */
          $.each(arrCropCatIds, function(index, cropCatId){

               let jsonCropCategory   = jsonCropCategoryList.find(({cropCategoryId}) => cropCategoryId === JSON.parse(cropCatId));
               let jsonCropIds        = jsonCropCategory.cropOrganismIds;
                lstCropIds            = lstCropIds.concat(jsonCropIds);
          });

          this.getCrops(lstCropIds);
    
          this.pest = {"pestId":'', "pestName":'Select Pests'};

          this.getNewObservationId();
      },

      /** Get Crops */
      getCrops(lstCropIds)
      {
          let lstCrops                = [];
           if(! this.observationId)
           {
             lstCrops.push({"organismId":'', "latinName":'Select Crop'});
           }
          let lstCropList             = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_LIST));
                $.each(lstCropIds, function(index, cropId){
                  let jsonDetailCrop  =   lstCropList.find(({organismId}) => organismId === cropId);
                  let jsonCrop        =   {'organismId':cropId, 'latinName':jsonDetailCrop.latinName};
                  lstCrops.push(jsonCrop);
            });

            this.crops = lstCrops;
      },

      /** Get Pests */
      getPests(lstPestIds)
      {
            let lstPests        = [];

           if(! this.observationId)
           {
             lstPests.push({"pestId":'', "pestName":'Select Pest'});
           }

          let lstPestList     = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_PEST_LIST));
          $.each(lstPestIds, function(index, pestId){
              let jsonDetailPest = lstPestList.find(({organismId}) => organismId === pestId);
              let jsonPest = {};
              if(jsonDetailPest)
              {
                jsonPest = {"pestId":jsonDetailPest.organismId, "pestName":jsonDetailPest.latinName};
              }
              else
              {
                jsonPest = {"pestId":pestId, "pestName":'Not Available -- '+pestId};
              }

                lstPests.push(jsonPest);
              
          });

          this.pests =  lstPests;
      },

      /** Get new observation Id */
      getNewObservationId(lstObservations)
      {
        let newId = 0;
        let observationIds=[];
        
        
        if(lstObservations)
        {
            $.each(lstObservations, function(index, observation){
                if(observation.observationId < 0)
                {
                  observationIds.push(Math.abs(observation.observationId));
                }
            });
            if(observationIds.length === 0)
            {
              newId = CommonUtil.CONST_OBSERVATION_COUNT_START_ID;
            }
            else
            {
              let largestValue = Math.max.apply(null, observationIds);
              newId = -Math.abs(largestValue + 1);
            }
        }
        else
        {
            newId = CommonUtil.CONST_OBSERVATION_COUNT_START_ID;
        }

        return newId;
      },

      /** Save Observation */
      saveObservation()
      {
        let This = this;
        let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));

          this.observationForStore.cropOrganismId     = this.crop.cropId;
          this.observationForStore.organismId         = this.pest.pestId;
          this.observationForStore.timeOfObservation  = this.strDateObservation;
          this.observationForStore.statusChangedTime  = this.strDateObservation;
          this.observationForStore.observationHeading = this.observationHeader;
          this.observationForStore.observationText    = this.observationText;
          

         if(this.observationId)
         {
              this.observationForStore.observationId  = this.observationId;
              let localObservationForStore            = this.observationForStore;
              let selectedObservationId               = this.observationId;

              $.each(lstObservations, function(index, jobservation)
              {
                    if(jobservation.observationId === selectedObservationId)
                    {
                      jobservation.cropOrganismId     = localObservationForStore.cropOrganismId;
                      jobservation.organismId     = localObservationForStore.organismId;
                      jobservation.timeOfObservation  = localObservationForStore.timeOfObservation;
                      jobservation.statusChangedTime  = localObservationForStore.statusChangedTime;
                      jobservation.observationData    = This.observation.observationData;
                      jobservation.observationHeading = localObservationForStore.observationHeading;
                      jobservation.observationText    = localObservationForStore.observationText;
                      jobservation.locationIsPrivate  = localObservationForStore.locationIsPrivate;
                      jobservation.polygonService     = localObservationForStore.polygonService;
                      jobservation.uploaded           = localObservationForStore.uploaded;

                      return false;
                    }
              });

         }
         else
         {
              this.observationForStore.observationId  = this.getNewObservationId(lstObservations);
              if(! lstObservations)
              {
                lstObservations = [];
                
              }
              lstObservations.push(this.observationForStore);
         }
              localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST, JSON.stringify(lstObservations) );
          this.$router.push({path:'/'});
          this.$router.go();
           
      },
      updateQuntificationData(schemaData){
          this.observation.observationData = schemaData;
      },

  },
  filters: {
    dateFormat: function(timeStr) {
      return DateTime.fromISO(timeStr).toFormat('yyyy-MM-dd\'T\'hh:mm:ss');
    }
  },
  watch: {
      pest:  {
      
      handler  (val)
      {
          if(this.pest.pestId)
          {
            this.observation.organismId=this.pest.pestId;
            this.isMounted = true;
          }
      },
      deep : true,
      immediate : true
      }


  } ,

  mounted(){

    if(this.observationId)
    {
      this.getObservationFromStore(this.observationId);
      this.observation.observationId=this.observationId
    }
    else{
            let newObservationId  = 0;
            let lstObservations   = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
                newObservationId  = this.getNewObservationId(lstObservations);   
                this.observation.observationId  = newObservationId;  
                this.observation.observationData='';
                this.getNewObservation();
    }
    this.observationForStore.locationIsPrivate=this.observation.locationIsPrivate;
    this.observationForStore.polygonService=this.observation.polygonService;
  },

}
</script>

<style scoped>
  #btnCloseQuantification {
        float: right;
        top: 0px;
        right: 0px;
  }

  #divSchemaForm {
    padding: 10px;
  }
</style>
