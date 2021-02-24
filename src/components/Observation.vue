<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button type="button" class="btn btn-primary" id="cameraLauncher" @click="launchCamera">{{ take_photo }}</button>
    <div>
        
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
      observation:{}
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
        let jsonObservation = {};

        let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
        jsonObservation = lstObservations.find(({observationId})=> observationId === id);
        this.observation  = jsonObservation;

        
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
               // iterate and get the required cropids relaed to selected observation id
                $.each (data, function(index, item){
                    if(item===jsonObservation.cropOrganismId)
                    {
                      console.log('item : '+item+' -- data : '+JSON.stringify(data));
                      return false;
                    }
                });
             }
           })
        });

       

    }
  },
  mounted(){
    if(this.observationId)
    {
      this.getObservationFromStore(this.observationId);
      console.log('observation id : '+this.observationId);
    }
  }
}
</script>