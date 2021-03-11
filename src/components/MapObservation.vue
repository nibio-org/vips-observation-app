<template>
    <div>
    <div id='map-observation'>
        <div v-if="isMyMapPanelVisible"><router-link :to="{name: 'Observation'}" class="btn btn-success ">Back</router-link></div>
    </div>

    <div id="ObservationMapPanel" v-if="isMyMapPanelVisible"> 
        <div>
            <input value="" placeholder="name" style="position:absolute">
        </div>

        <div >
              
            <select>
                <option>Select</option>
            </select>
            <br>
            <select>
                <option>Select</option>
            </select>
        </div>
    </div>

    </div>
</template>

<script>
import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';

import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import Collection from 'ol/Collection'
import {fromLonLat} from 'ol/proj'


let parser = new WMTSCapabilities();


export default {
     name : 'MapObservation',
     methods : {
            initMap(){

                let featureOverlay = this.featureOverlay();
                let newFeatureOverlay = this.newFeatureOverlay();
                
                fetch('https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?Version=1.0.0&service=wmts&request=getcapabilities')
                .then(function (response){
                        return response.text();
                })
                .then(function(text){
                    let parser = new WMTSCapabilities();
                    let result = parser.read(text);
                    
                    let options = optionsFromCapabilities(result, { 
                                    layer : 'topo4',
                                    matrixSet: 'EPSG:3857',
                                });


                    new Map({
                        layers: [

                                new TileLayer({
                                    opacity : 1,
                                    source : new WMTS(options),
                                }),
                                //featureOverlay,
                                //newFeatureOverlay,


                        ],
                        controls: [],
                        target: 'map-observation',
                        view : new View ({
                            center:fromLonLat([16, 63]),
                            zoom : 4.2
                        })
                    })
                })
            },

        featureOverlay(){
                let features = new Collection();
                return new VectorLayer({
                        source : new VectorSource ({
                            features : features
                        })
                })
        },

        newFeatureOverlay(){
            return new VectorLayer({
                source : new VectorSource({
                    features : new Collection()
                })
            })
        },

        

     },
     mounted() {
        let routeParam=this.$route.params;
       
        // This ensures that the map fills the entire viewport
		var mapDiv = document.getElementById("map-observation");
		var navDiv = document.getElementById("vipsobsappmenu");
        var appDiv = document.getElementById("app");
        if(this.isMapPanelVisible)
        {
            var panelObDiv = document.getElementById("ObservationMapPanel");
        }

		appDiv.style.marginTop="0";
		appDiv.style.paddingRight="0";
		appDiv.style.paddingLeft="0";
        if(this.isMyMapPanelVisible)
            {
                mapDiv.style.height = (screen.height - navDiv.offsetHeight - panelObDiv.offsetHeight) + "px";
            }
        else
        {
                mapDiv.style.height = (screen.height - navDiv.offsetHeight ) + "px";
        }
        
        if(routeParam.geoinfo)
        {
         if(this.geoinfo)
         {
            this.myGeoInfo = this.geoinfo;
         }
         else{
             this.myGeoInfo = routeParam.geoinfo;
         }
        }

        if(routeParam.isMapPanelVisible)
        {
            if(this.isMapPanelVisible)
            {
                this.isMyMapPanelVisible = this.isMapPanelVisible;
            }
            else{
                this.isMyMapPanelVisible = routeParam.isMapPanelVisible;
            }
        }




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
    },

}
</script>

<style>
   html, body, #map-observation {
        margin: 0;
    width: 100%;
    }

    #ObservationMapPanel {
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>