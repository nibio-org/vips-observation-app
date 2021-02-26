<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button type="button" class="btn btn-primary" id="cameraLauncher" @click="launchCamera">{{ take_photo }}</button>


    <div class="dropdown"></div >
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"  v-text="crop.cropName">
        Crops
        </button>
       <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a  class="dropdown-item" v-on:click="selectCrop(crop.organismId, crop.latinName)" href="#" v-for="crop in crops" v-bind:class="{ active: isActive }" >{{crop.latinName}}</a> 
       </div>
   


  </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
export default {
  name: 'Observation',
  props: ['observationId'],
  data () {
    return {
      msg: 'Observasjon',
      take_photo: "Ta bilde",
      observation:{},
      crops:[],
      crop:{},
      isActive : false
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
              this.getObservationCrops(jsonObservation);

          }
          else {
            //TODO for new Observation
          }  
      },

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


            $.each(lstCropIds, function(index, cropId){
                //lstObservations.find(({observationId})=> observationId === id);   
                let jsonDetailCrop  =   lstCropList.find(({organismId}) => organismId === cropId);
                let jsonCrop        =   {'organismId':cropId, 'latinName':jsonDetailCrop.latinName};
                lstCrops.push(jsonCrop);
            });
              let jsonSelectedCrop= lstCrops.find(({organismId}) => organismId === jsonObservation.cropOrganismId);
              this.crops = lstCrops;
              this.crop = {"cropId":jsonSelectedCrop.organismId, "cropName":jsonSelectedCrop.latinName};

      },

      selectCrop(cropId, cropName)
      {
          this.crop={"cropId":cropId,"cropName":cropName};
         
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