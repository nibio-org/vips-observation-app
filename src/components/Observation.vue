
<template>
  <div class="hello container">
    <div class="row">
        <h1 ref='titleObservation'>{{ msg }}</h1>
    </div>

    <div v-if="observation.deleted">
        <div class="alert alert-warning" role="alert">
              {{ $t("prop.err.observation.remove.warn") }}
        </div>
    </div>

    <div class="row">
      
      <select id="divCropId" ref='divCropId' v-model="crop.cropId" v-on:change="selectCrop($event)">
          <option v-for="crop in crops" v-bind:value='crop.organismId' >{{crop.latinName}}</option>
      </select>
    </div>

    <div class="row">
        <select  v-model="pest.pestId" id='divPestId' ref='divPestId'>
            <option v-for="pest in pests" v-bind:value='pest.pestId'>{{pest.pestName}}</option>
        </select>
    </div>

    <div ref='divDateTime' class="row">
      <!-- <input type="datetime-local" v-bind='strDateObservation | dateFormat' v-model="strDateObservation"/> -->
        <input type="datetime-local" v-model="strDateObservation" v-on:change="capturedTime($event)"/>
    </div>
    <div v-if="isMounted" class="row">
        <router-link id="linkMap" ref='linkMap' :to="{name:'MapObservation', params: {observationId:observation.observationId,geoinfo:mapGeoinfo,isMapPanelVisible:newMapPanel,locationPointOfInterestId:mapLocationPointOfInterestId, observation:observation}}">Observation Map </router-link>
    </div>
    <div v-if="mapGeoinfo" id="divMapGeoInfo" class="row">
      <div v-if="isMounted" class="col">
            <map-observation :geoinfo="mapGeoinfo" :isMapPanelVisible="isMapPanelVisible" :locationIsPrivate="observation.locationIsPrivate" :polygonService="observation.polygonService" v-on:visibilityObservationAction="visibilityObservationAction" ></map-observation>
      </div>
    </div> 

    <div v-if="isMounted" >
         <photo :isImageVisible=false :observationId="observationId" :organismId="observation.organismId" ></photo>
        <photo :isImageVisible=true :observationId="observation.observationId" :organismId="observation.organismId" :imageFileName="photo.observationIllustrationPK.fileName" :isDeleted='photo.deleted' :isUploaded="photo.uploaded" v-for="photo in observation.observationIllustrationSet" v-bind:key="photo.observationIllustrationPK.fileName"></photo>
      <!-- <photo-observation :observationId="observation.observationId" :organismId="observation.organismId" :imageFileName="photo.observationIllustrationPK.fileName" v-for="photo in observation.observationIllustrationSet" v-bind:key="photo.observationIllustrationPK.fileName"></photo-observation> -->
    </div>      

      <div class="clearfix"/>
    <div>
      <div class="row"><button class="btn btn-success" v-on:click="showQuantification"><span><h5>Tell/kvantifiser</h5></span></button></div>
      <div v-if="isQuantification" class="row">
          <div v-if="isMounted" id='divSchemaForm' class="border border-primary rounded" >
              <button id="btnCloseQuantification" class="border border-primary rounded-circle" type="button" v-on:click="closeQuantification">x</button>              
              <!-- <router-link :to="{name: 'Quantification', params: {observationId:observation.observationId, organismId:observation.organismId, schemaData:observation.observationData}}" >Tell/kvantifiser</router-link> -->
              
              <quantification :isEditable="false" :observationId="observation.observationId" :organismId="observation.organismId" :schemaData="observation.observationData" v-on:updateQuntificationData="updateQuntificationData"> </quantification>
          </div>
      </div>
    </div>

      <div ref='divObservationText' >
        <div class="row">Observation Detail</div>
        <div class="row"><input type="text" v-model="observationHeader"/></div>
        <div class="row"><textarea v-model="observationText" /></div>
      </div>
        <div v-show="isSync"><sync ref="sync" :isSyncNeeded="isSync"/></div>

        <div v-if="observation.deleted"></div>
        <div v-else class="float-right">
          <button class="btn btn-secondary " v-on:click="saveObservation">Save</button>
          <button v-show="isDeleteBttnVisible"  class="btn btn-danger " v-on:click="callForRemoveObservation">Delete</button>
        </div>

      <modal-simple
        v-show="isModalSimpleVisible" 
        v-on:close="closeModalSimple"           
    >
        <template v-slot:header>
            !! ERROR !!
        </template>

        <template v-slot:body>
            {{ $t("prop.err.observation.geoinfo") }}
        </template>

        <template v-slot:footer>
            &nbsp;
        </template>            
    </modal-simple>

    <modal
        v-show="isModalVisible"
                    v-on:close="closeModal"
                    v-on:action="prepareForRemove"
                >
            
                <template v-slot:header>
                    !! ALERT !!
                </template>

                <template v-slot:body>
                    {{ $t("prop.err.observation.remove.msg") }}
                </template>

                <template v-slot:footer>
                    Please chose the option below :
                </template>
    </modal>      

  </div>  
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import { DateTime } from 'luxon'
import MapObservation from '@/components/MapObservation'
import PhotoObservation from '@/components/PhotoObservation'
import Photo from '@/components/Photo.vue'
import Quantification from '@/components/Quantification.vue'
import Sync from '@/components/Sync'
import ModalSimple from '@/components/ModalSimple'
import Modal from '@/components/Modal.vue'



export default {
  name: 'Observation',
  props: ['observationId','paramGeoinfo','paramObservation'],
  components: {MapObservation,PhotoObservation,Photo,Quantification,Sync,ModalSimple,Modal},
  data () {
    return {
      isDeleteBttnVisible             : true,
      isModalSimpleVisible            : false,
      isModalVisible                  : false,
      isSync                          : false,
      isQuantification                : false,
      isMounted                       : false,
      msg                             : 'Observasjon',
      observation                     : {},
      crops                           : [],
      pests                           : [],
      crop                            : {'cropId':'','cropName':'Select Crop'},
      pest                            : {'pestId':'','pestName':'Select Pest'},
      isActive                        : false,
      dateObservation                 : DateTime,
      strDateObservation              : '',
      observationHeader               : '',
      observationText                 : '',
      mapGeoinfo                      : null,
      mapLocationPointOfInterestId    : '',
      isMapPanelVisible               : false,
      newMapPanel                     : true,
      observationForStore             : 
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
    callForRemoveObservation()
    {
            this.isModalVisible = true;
    },
    prepareForRemove(){
            if(this.observationId)
            {
              if(this.observationId < 0)
              {
                 /** Just remove it locally */
                  this.removeLocalObservation(this.observationId);
                  this.$router.replace({path:'/'});
              }
              else
              {
                /** Mark the record - for sending to server */
                this.observationForStore.deleted=true;
                this.saveObservation();
              }
            }
            this.isModalVisible = false;

    },
    closeModalSimple(){
              this.isModalSimpleVisible   =  false;
    },
    closeModal(){
              this.isModalVisible         = false;
    },

    /** Remove local Observation */
    removeLocalObservation(id)
    {
        let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
        let indexPosition       = null;
        $.each(lstObservations, function(index, observation){
              if(observation.observationId===id)
              {
                 indexPosition = index;
                 return false;
              }
        });

        if(indexPosition)
        {
          this.removeImageRecord(id);

          lstObservations.splice(indexPosition,1);
          localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(lstObservations));
        }
    },
    /**
     * Remove image data from indexed DB 
     */
    removeImageRecord(observationId){
      let entityName = CommonUtil.CONST_DB_ENTITY_PHOTO;
      let dbRequest =  indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
      let indexName =  CommonUtil.CONST_DB_INDEX_NAME_OBSERVATION_ID;
      dbRequest.onsuccess = function(evt) {
        let db = evt.target.result;
        let transaction     =   db.transaction([entityName],'readwrite'); 
        let objectstore     =   transaction.objectStore(entityName);
        let indexStore      =   objectstore.index(indexName);
        let keyRange        =   IDBKeyRange.only(observationId);
        let cursorRequest   =   indexStore.openCursor(keyRange);
        cursorRequest.onsuccess = function(event){
          let cursor  =  event.target.result;
          if(cursor)
          {
            cursor.delete();
            cursor.continue();
          }
        }


      }

    },
    validate()
              {
                  if(this.mapGeoinfo) {
                    return true;
                    }
                  else
                  {
                      this.isModalSimpleVisible = true;
                      return false;
                  }
              },    
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

              
/*              
              let lastQuoteRemoved    = this.observation.observationData.slice(0,0);
              console.log(lastQuoteRemoved);
              this.observation.observationData = lastQuoteRemoved.slice(0,0);
              console.log(this.observation.observationData);
*/
              
              if(this.paramObservation)
              {
                
                this.getObservationCrops(this.paramObservation);
                this.getObservationPests(this.paramObservation);

                this.strDateObservation = DateTime.fromISO(this.paramObservation.timeOfObservation).toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
              }
              else
              {
                jsonObservation                         = lstObservations.find(({observationId})=> observationId === id);                           // Selection Observation
                this.observation                        = jsonObservation;
                this.observation.observationData        = JSON.parse(jsonObservation.observationData);
                if(jsonObservation.statusTypeId) {}
                else
                {
                  this.observation.statusTypeId = CommonUtil.CONST_STATUS_PENDING;
                }

                /* For related Crop and Crop list */
                this.getObservationCrops(jsonObservation);
                /* For related Pest and Pest list */
                this.getObservationPests(jsonObservation);

                this.strDateObservation = DateTime.fromISO(jsonObservation.timeOfObservation).toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
                this.observationHeader  =  jsonObservation.observationHeading;
                this.observationText    =   jsonObservation.observationText;                
              }

              if(this.paramGeoinfo)
              {
                this.mapGeoinfo = this.paramGeoinfo;
              }
              else if(jsonObservation.geoinfo)
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
              //this.observation.geoinfo = this.mapGeoinfo;
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
                          if(parseInt(item)===parseInt(jsonObservation.cropOrganismId))
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

              let jsonSelectedCrop= this.crops.find(({organismId}) => organismId === parseInt(jsonObservation.cropOrganismId));
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
                if(parseInt(cropPests.cropOrganismId) === parseInt(jsonObservation.cropOrganismId))
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
          this.observation.cropOrganismId=event.target.value;
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

      capturedTime(event)
      {
        this.observation.timeOfObservation=this.strDateObservation;

      },
      
      /** Get New Observation  */
      getNewObservation()
      {
          this.isDeleteBttnVisible  = false;
          let lstCropIds              = [];
          //let lstPestIds              = [];
          let cropCategoryIdProp      = CommonUtil.CONST_CROP_CATEGORY_ID; 
          let jsonCrops               = [];
          let arrCropCatIds           = localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST).split(",");
          let jsonCropCategoryList    = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY));
          //let lstCropPestList         = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_PEST_LIST));

          /* Iterate Selected Crop Ids */
          $.each(arrCropCatIds, function(index, cropCatId){
              if(cropCatId != "")
              {
               let jsonCropCategory   = jsonCropCategoryList.find(({cropCategoryId}) => cropCategoryId === JSON.parse(cropCatId));
               let jsonCropIds        = jsonCropCategory.cropOrganismIds;
                lstCropIds            = lstCropIds.concat(jsonCropIds);
              }
          });

          this.getCrops(lstCropIds);
    
          this.pest = {"pestId":'', "pestName":'Select Pests'};

          this.getNewObservationId();
      },

      /** Get Crops */
      getCrops(lstCropIds)
      {
          let This = this;
          let lstCrops                = [];
           if(! this.observationId)
           {
             lstCrops.push({"organismId":'', "latinName":'Select Crop'});
           }
          let lstCropList             = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_LIST));
                $.each(lstCropIds, function(index, cropId){
                  let jsonDetailCrop  =   lstCropList.find(({organismId}) => organismId === cropId);
                  let organismLocaleSet = jsonDetailCrop.organismLocaleSet;
                  let corpName = jsonDetailCrop.latinName;

                  if(organismLocaleSet)
                  {
                    let strLocale = This.getSystemLocale();
                    
                     organismLocaleSet.forEach(function(localObj) {

                       if(localObj.organismLocalePK.locale === strLocale)
                       {
                         if(localObj.localName)
                         {
                           corpName = localObj.localName;
                         }

                         return false;

                       }
                     });

                  }
                  let jsonCrop        =   {'organismId':cropId, 'latinName':corpName};
                  lstCrops.push(jsonCrop);
            });

            this.crops = lstCrops;
      },

      /** Get Pests */
      getPests(lstPestIds)
      {
        let This = this;
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
                let pestName = jsonDetailPest.latinName;
                let organismLocaleSet = jsonDetailPest.organismLocaleSet;

                if(organismLocaleSet)
                {
                  let strLocale = This.getSystemLocale();
                  organismLocaleSet.forEach(localObj => {
                    if(localObj.organismLocalePK.locale === strLocale)
                    {
                      if(localObj.localName)
                      {
                        pestName = localObj.localName;
                      }
                      return false;
                    }
                  });
                }
                jsonPest = {"pestId":jsonDetailPest.organismId, "pestName":pestName};
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
        if(this.validate()) {}
        else {
          return false
        }
        let This = this;
        

        let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
        /** Whether record to be updated */
        let isRecordAvailable = null;
        if(lstObservations)
        {
          isRecordAvailable = lstObservations.find(({observationId})=> observationId === this.observationId);
        }

          
          this.observationForStore.cropOrganismId             = this.crop.cropId;
          this.observationForStore.organismId                 = this.pest.pestId;
          this.observationForStore.timeOfObservation          = this.strDateObservation;
          this.observationForStore.statusChangedTime          = this.strDateObservation;
          this.observationForStore.statusTypeId               = this.observation.statusTypeId;
          this.observationForStore.isQuantified               = this.observation.isQuantified;
          this.observationForStore.userId                     = this.observation.userId;
          this.observationForStore.geoinfo                    = JSON.stringify(this.mapGeoinfo); //this.observation.geoinfo;
          this.observationForStore.locationPointOfInterestId  = this.observation.locationPointOfInterestId;
          this.observationForStore.broadcastMessage           = this.observation.broadcastMessage;
          this.observationForStore.statusRemarks              = this.observation.statusRemarks;
          this.observationForStore.observationHeading         = this.observationHeader;
          this.observationForStore.observationText            = this.observationText;
          this.observationForStore.observationData            = JSON.stringify(this.observation.observationData)//'{"number":0,"unit":"Number"}'; //"{\"number\":0,\"unit\":\"Number\"}"; 
          this.observationForStore.observationIllustrationSet = this.observation.observationIllustrationSet;


         if(this.observationId && isRecordAvailable)
         {
              this.observationForStore.observationId  = this.observationId;
              let localObservationForStore            = this.observationForStore;
              let selectedObservationId               = this.observationId;

              $.each(lstObservations, function(index, jobservation)
              {
                    if(jobservation.observationId === selectedObservationId)
                    {
                      jobservation.cropOrganismId             = localObservationForStore.cropOrganismId;
                      jobservation.organismId                 = localObservationForStore.organismId;
                      jobservation.timeOfObservation          = localObservationForStore.timeOfObservation;
                      jobservation.statusChangedTime          = localObservationForStore.statusChangedTime;
                      jobservation.statusTypeId               = localObservationForStore.statusTypeId;
                      jobservation.isQuantified               = localObservationForStore.isQuantified;
                      jobservation.userId                     = localObservationForStore.userId;
                      jobservation.geoinfo                    = localObservationForStore.geoinfo;
                      jobservation.locationPointOfInterestId  = localObservationForStore.locationPointOfInterestId;
                      jobservation.broadcastMessage           = localObservationForStore.broadcastMessage;


                      jobservation.observationData            = localObservationForStore.observationData;
                      jobservation.observationHeading         = localObservationForStore.observationHeading;
                      jobservation.observationText            = localObservationForStore.observationText;
                      jobservation.locationIsPrivate          = localObservationForStore.locationIsPrivate;
                      jobservation.polygonService             = localObservationForStore.polygonService;
                      jobservation.uploaded                   = localObservationForStore.uploaded;

                      if(localObservationForStore.deleted)
                      {
                        jobservation.deleted = localObservationForStore.deleted;
                      }

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
              this.observationForStore.statusTypeId=CommonUtil.CONST_STATUS_PENDING;
              lstObservations.push(this.observationForStore);
         }
              localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST, JSON.stringify(lstObservations) );
/*               if(this.isSync===false)
              {
                this.isSync = true;

                this.$refs.sync.syncObservationSendPrepareSingleObject(this.observationForStore,1);
                this.isSync = false;
              } */
          this.$router.replace({path:'/'});
          //this.$router.push({path:'/'});
          //this.$router.go();
           
      },
      updateQuntificationData(schemaData){
          this.observation.observationData = schemaData;
      },
      getSystemLocale()
      {
          var localePrefer        =   null;
          var localePrefer2       =   null;
          if(typeof navigator.language != 'undefined')
          {
              localePrefer     =   navigator.language;
              localePrefer2    =   localePrefer.trim().substring(0,2);
          }

          return localePrefer2;
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
    if(this.paramObservation)
    {
        this.observation  = this.paramObservation;
    }
    if(this.paramGeoinfo)
    {
        this.mapGeoinfo = this.paramGeoinfo;
    }



    if(this.observationId)
    {
      this.getObservationFromStore(this.observationId);
      this.observation.observationId=this.observationId;
    }
    else{
          let isCropIdsAvailable = false;
            if(localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST))
            {
              
              let lstCropIds       = localStorage.getItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST).split(",");
              if(lstCropIds.length > 0)
              {
                isCropIdsAvailable = true;
              }
            }

            if(isCropIdsAvailable)
            {
              let newObservationId      = 0;
              let lstObservations       = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
                  newObservationId      = this.getNewObservationId(lstObservations);   
                  this.observation.observationId  = newObservationId;  
                  this.observation.observationData='';
                  this.getNewObservation();
            }
            else
            {
                  this.$router.replace({path:'/cropCategory'});
            }
    }
    if(!this.paramObservation)
    {
        this.observationForStore.locationIsPrivate=this.observation.locationIsPrivate;
        this.observationForStore.polygonService=this.observation.polygonService;
    }
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
