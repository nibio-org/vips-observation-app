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
import CommonUtil from '@/components/CommonUtil'
import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';

import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import Collection from 'ol/Collection';
import {fromLonLat} from 'ol/proj';

import Circle from 'ol/geom/Circle';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';


let parser = new WMTSCapabilities();


export default {
     name : 'MapObservation',
     props : ['geoinfo','isMapPanelVisible'],
     data(){
         return {
                    isMyMapPanelVisible : '',
                    myGeoInfo:'',
                    latitude:0,
                    longitude:0,
                    mapZoom:0
             }
     },
     methods : {
            initMap(){
                
                let urlMap              =   CommonUtil.CONST_GPS_URL_NORWAY_MAP;

                let latitude            =   this.latitude;
                let longitude           =   this.longitude;
                let mapZoom             =   this.mapZoom;

                let featureOverlay      =   this.featureOverlay();
                let newFeatureOverlay   =   this.newFeatureOverlay();

                let image               =   this.myImage();
                let styles              =   this.mygeoStyle(image);
                //let styleFunction       =   this.myStyleFunction(styles,feature);
                //let styleFunction       =   this.myStyleFunction(styles);
                
                let vectorSource     =   this.myVectorGeoSource();
                //vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));
                let vectorGeoLayer      =   this.myVectorGeoLayer(vectorSource);
                
                fetch(urlMap)
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
                                vectorGeoLayer

                        ],
                        controls: [],
                        target: 'map-observation',
                        view : new View ({
                            center:fromLonLat([latitude, longitude]),
                            //center:fromLonLat([16,63]),
                            zoom : mapZoom
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

        myVectorGeoSource(){
            if(this.myGeoInfo)
            {
                return new VectorSource({
                    features : new GeoJSON({dataProjection:"EPSG:4326", 
                    featureProjection:"EPSG:3857"}).readFeatures(this.myGeoInfo),
                })
            }
        },

        myVectorGeoLayer(vectorSource){
                return new VectorLayer({
                    source : vectorSource,
                    //style: styleFunction,
                })
        },

        mygeoStyle(image)
        {
            return  {
                        'Point': new Style({
                            image: image,
                        }),
                        'LineString': new Style({
                            stroke: new Stroke({
                            color: 'green',
                            width: 1,
                            }),
                        }),
                        'MultiLineString': new Style({
                            stroke: new Stroke({
                            color: 'green',
                            width: 1,
                            }),
                        }),
                        'MultiPoint': new Style({
                            image: image,
                        }),
                        'MultiPolygon': new Style({
                            stroke: new Stroke({
                            color: 'yellow',
                            width: 1,
                            }),
                            fill: new Fill({
                            color: 'rgba(255, 255, 0, 0.1)',
                            }),
                        }),
                        'Polygon': new Style({
                            stroke: new Stroke({
                            color: 'blue',
                            lineDash: [4],
                            width: 3,
                            }),
                            fill: new Fill({
                            color: 'rgba(0, 0, 255, 0.1)',
                            }),
                        }),
                        'GeometryCollection': new Style({
                            stroke: new Stroke({
                            color: 'magenta',
                            width: 2,
                            }),
                            fill: new Fill({
                            color: 'magenta',
                            }),
                            image: new CircleStyle({
                            radius: 10,
                            fill: null,
                            stroke: new Stroke({
                                color: 'magenta',
                            }),
                            }),
                        }),
                        'Circle': new Style({
                            stroke: new Stroke({
                            color: 'red',
                            width: 2,
                            }),
                            fill: new Fill({
                            color: 'rgba(255,0,0,0.2)',
                            }),
                        }),
            };
        },

        myImage()
        {
            return new CircleStyle({
                    radius: 5,
                    fill: null,
                    stroke: new Stroke({color: 'red', width: 1}),
                    });
        },

        myStyleFunction(styles,feature)
        {
            return styles[feature.getGeometry().getType()]; 
        },
        

     },
     mounted() {
        this.latitude = CommonUtil.CONST_GPS_DEFAULT_LATITUDE_NORWAY;
        this.longitude = CommonUtil.CONST_GPS_DEFAULT_LONGITUDE_NORWAY;

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
             this.myGeoInfo = routeParam.geoinfo;
        }
        if(this.geoinfo)
        {
            this.myGeoInfo = this.geoinfo;
        }

        if(this.myGeoInfo)
        {
            this.latitude   =   this.myGeoInfo.features[0].geometry.coordinates[0];
            this.longitude  =   this.myGeoInfo.features[0].geometry.coordinates[1];
            
            //console.log ('geometry : '+JSON.stringify(this.myGeoInfo.features[0].geometry.coordinates[0]));

            this.mapZoom             = CommonUtil.CONST_GPS_OBSERVATION_ZOOM;
        }
        else
        {
            this.mapZoom = CommonUtil.CONST_GPS_DEFAULT_ZOOM;
        }


        if(routeParam.isMapPanelVisible)
        {
            this.isMyMapPanelVisible = routeParam.isMapPanelVisible;
            
        }
        if(this.isMapPanelVisible)
        {
            this.isMyMapPanelVisible = this.isMapPanelVisible;
            
            
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