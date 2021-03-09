<template>
    <div>Observation Map 
        <div id='map-observation' >
            
        </div>
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
        this.$nextTick(function () {
            this.initMap();
         });
     }
}
</script>

<style>
    #map-observation {
    width: 100%;
    height: 500px;
    }
</style>