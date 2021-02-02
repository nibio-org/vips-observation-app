<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button type="button" class="btn btn-primary" id="cameraLauncher" @click="launchCamera">{{ take_photo }}</button>
  </div>
</template>

<script>
export default {
  name: 'Observation',
  data () {
    return {
      msg: 'Observasjon',
      take_photo: "Ta bilde"
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
		}
  },
  created () {
    console.info("The observation component was initialized");
  }
}
</script>