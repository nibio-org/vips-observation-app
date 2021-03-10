<template>
    <div id='map-observation'>
    </div>
</template>

<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
//import {Tile as TileLayer, Vector as VectorLayer } 

import OSM from 'ol/source/OSM'
//import XYZ from 'ol/source/XYZ';
import 'ol/ol.css'

export default {
     name : 'MapObservation',
     methods : {
            initMap(){
                new Map ({
                    target : 'map-observation',
                    layers : [
                        new TileLayer({
                            source : new OSM()
                            //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }),
                    ],

                    view: new View({
                        zoom : 4,
                        center:[0,0],
                        //constrainResolution : true
                    })

                })
            }

     },
     mounted() {
		// This ensures that the map fills the entire viewport
		var mapDiv = document.getElementById("map-observation");
		var navDiv = document.getElementById("vipsobsappmenu");
		var appDiv = document.getElementById("app");
		appDiv.style.marginTop="0";
		appDiv.style.paddingRight="0";
		appDiv.style.paddingLeft="0";
		mapDiv.style.height = (screen.height - navDiv.offsetHeight) + "px";
		 
        this.$nextTick(function () {
            this.initMap();
         });
     },
	 beforeDestroy() {
		// This resets the container layout when leaving the router page
		var appDiv = document.getElementById("app");
		appDiv.style.marginTop="60px";
		appDiv.style.paddingRight="15px";
		appDiv.style.paddingLeft="15px";
		console.info("beforeDestroy");
	}
}
</script>

<style>
   html, body, #map-observation {
        margin: 0;
    width: 100%;
    /*height: 600px;*/
    }
</style>