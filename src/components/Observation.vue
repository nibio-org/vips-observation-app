<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button type="button" class="btn btn-primary" id="cameraLauncher" @click="launchCamera">{{ take_photo }}</button>
<br>

    <div class="btn-group">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"  v-text="crop.cropName">
        Crops
        </button>
       <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a  class="dropdown-item" v-on:click="selectCrop(crop.organismId, crop.latinName)" href="#" v-for="crop in crops" >{{crop.latinName}}</a> 
       </div>
    </div>
    <br>
      <div class="clearfix"/>
    <div class="btn-group">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"  v-text="pest.pestName">
        Pests
        </button>
       <div class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
            <a  class="dropdown-item" v-on:click="selectPest(pest.pestId, pest.pestName)" href="#" v-for="pest in pests" >{{pest.pestName}}</a> 
       </div>
    </div>
    <div class="clearfix"/>
    <div>
        {{strDateObservation | dateFormat}}
    </div>

    <div class="card">
      <div class="card-header">
        Observation Detail
      </div>
      <div class="card-body">
        <h5 class="card-title text-success"><strong>{{observationHeader}}</strong></h5>
        <p class="card-text">{{observationText}}</p>
       
      </div>
    </div>

  </div>  
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import { DateTime } from 'luxon'
export default {
  name: 'Observation',
  props: ['observationId'],
  data () {
    return {
      msg: 'Observasjon',
      take_photo: "Ta bilde",
      observation:{},
      crops:[],
      pests:[],
      crop:{},
      pest:{},
      isActive : false,
      dateObservation : DateTime,
      strDateObservation:'',
      observationHeader : '',
      observationText : ''
    }
  },
  methods:{
    onfail: function(message) {
      alert(message);
    },
    renderPhoto: function(imageURI) {
      console.info("Image info: " + imageURI);
    },
    launchCamera: function() {
			console.info("The camera should launch now");
			navigator.camera.getPicture(this.renderPhoto, this.onFail, { 
	            quality: 50,
	            destinationType: Camera.DestinationType.FILE_URI ,
	            correctOrientation: true
	        });
    },
    getObservationFromStore(id)
    {
        // For existing observation
        if(id)
        {
              
              let jsonObservation = {};
              
              let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));              // Observation List
              jsonObservation     = lstObservations.find(({observationId})=> observationId === id);                           // Selection Observation
              this.observation    = jsonObservation;
              /* For related Crop and Crop list */
              this.getObservationCrops(jsonObservation);
              /* For related Pest and Pest list */
              this.getObservationPests(jsonObservation);

              this.strDateObservation = jsonObservation.timeOfObservation;
              this.observationHeader = jsonObservation.observationHeading;
              this.observationText  = jsonObservation.observationText;

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
            $.each(lstCropIds, function(index, cropId){
                let jsonDetailCrop  =   lstCropList.find(({organismId}) => organismId === cropId);
                let jsonCrop        =   {'organismId':cropId, 'latinName':jsonDetailCrop.latinName};
                lstCrops.push(jsonCrop);
            });


              let jsonSelectedCrop= lstCrops.find(({organismId}) => organismId === jsonObservation.cropOrganismId);
              this.crops = lstCrops;
              this.crop = {"cropId":jsonSelectedCrop.organismId, "cropName":jsonSelectedCrop.latinName};
      },

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
            
            $.each(lstPestIds, function(index, pestId){
                  let jsonDetailPest = lstPestList.find(({organismId}) => organismId === pestId);
                  let jsonPest = {"pestId":jsonDetailPest.organismId, "pestName":jsonDetailPest.latinName};
                  lstPests.push(jsonPest);

            })

            this.pests =  lstPests;

            let jsonSelectedPest = lstPests.find(({pestId}) => pestId === jsonObservation.organismId);
            this.pest = {"pestId":jsonSelectedPest.organismId, "pestName":jsonSelectedPest.pestName};


      },

      selectCrop(cropId, cropName)
      {
          this.crop={"cropId":cropId,"cropName":cropName};
         
      },
      selectPest(pestId, pestName)
      {
          this.pest={"pestId":pestId,"pestName":pestName};
         
      }

      

  },
  filters: {
    dateFormat: function(timeStr) {
      //return DateTime.fromISO(timeStr).toISODate();
      return DateTime.fromISO(timeStr).toLocaleString(DateTime.DATETIME_MED);
    }
  },  
  mounted(){
    if(this.observationId)
    {
      this.getObservationFromStore(this.observationId);
    }
  }
}
</script>

<style scoped>

</style>