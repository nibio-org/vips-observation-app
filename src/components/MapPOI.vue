<template>
    <div>
            <router-link :to="{name:'PlacesList', params: {}}" >Back</router-link>
            MAP
            <div id='map-poi' style="border: 2px solid green;height: 400px;"></div>
            <div id="poiMarker">
                <img src="@/assets/map_icon.png"> 
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

import {toStringXY} from 'ol/coordinate';
import {transform} from 'ol/proj';
import Point from 'ol/geom/Point';
import {Modify} from 'ol/interaction';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import Geolocation from 'ol/Geolocation';


export default{
    name    :   'MapPOI',
    props   :   ['pointOfInterestId'],
    data()      {
                    return {
                        poi         : {},
                        mapZoom     :   0
                    }
    },
    methods :   {
                getPointOfInterest(id){
                    let lstPOI  =   JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                    let poi     =   lstPOI.find(({pointOfInterestId}) => pointOfInterestId === id);
                    
                    this.poi    =   poi;

                },
                initMap() 
                {
                    let mapZoom             =   this.mapZoom;
                    let urlMap              =   CommonUtil.CONST_GPS_URL_NORWAY_MAP;
                    let latitude            =   this.poi.latitude;
                    let longitude           =   this.poi.longitude;
                    let image               =   this.myImage();
                    let vectorSource        =   this.myVectorGeoSource(JSON.parse(this.poi.geoJSON));
                    let vectorGeoLayer      =   this.myVectorGeoLayer(vectorSource,image)
                    let mapView             =   this.myView(longitude,latitude,mapZoom);
                    let coordinate          =   [longitude,latitude];
                    let mapInteractions     =   [];
                    let pointMarker         =   this.myOverLay (coordinate);
                    let pointMarkerCoord    =   this.myOverLayCoord(longitude,latitude);
                    //let mapInteractions     =   this.myInteractions(this.mapInteractions);
console.log(vectorSource);
                    fetch(urlMap)
                        .then(function (response){
                                return response.text();
                        })
                        .then(function(text){
                        
                        let parser  =   new WMTSCapabilities();
                        let result  =   parser.read(text);
                        let options =   optionsFromCapabilities(result, { 
                                            layer       : 'topo4',
                                            matrixSet   : 'EPSG:3857',
                                        });
                   
                        let myMap = new Map({
                                        layers : [
                                            new TileLayer ({
                                                opacity : 1,
                                                source  : new WMTS(options),
                                            }),
                                            vectorGeoLayer
                                        ],
                                        controls    : [],
                                        interactions: mapInteractions,
                                        target      : 'map-poi',
                                        view        :  mapView,
                                        overlays    : [pointMarkerCoord],                                        
                                        renderer    : 'canvas',
                            })
                        })
                },
            myImage()
            {
                var fill = new Fill({
                    color: '#FF0000'    //[180, 0, 0, 0.3]
                });

                return new CircleStyle({
                        radius: 5,
                        fill: fill,
                        stroke: new Stroke({color: 'red', width: 4}),
                        });
            },
            myVectorGeoSource(geoInfo){
                if(geoInfo)
                {
                    return new VectorSource({
                        features : new GeoJSON({dataProjection:"EPSG:4326", 
                        featureProjection:"EPSG:3857"}).readFeatures(geoInfo),
                    })
                }
            },
            myVectorGeoLayer(vectorSource,image){
                    return new VectorLayer({
                        source  :   vectorSource,
                        style   :   new Style({
                                            image: image,
                                        }),
                    })
            },

            myView(longitude,latitude,mapZoom){
                return new View ({
                                    center:fromLonLat([longitude,latitude]),
                                    zoom : mapZoom
                                })
            },  
            myOverLayCoord(longitude,latitude)
            {
                let coordinate = [longitude,latitude];
                return this.myOverLay(coordinate);
            },            
            myOverLay(coordinates){
                return new Overlay({
                                position :  fromLonLat(coordinates) ,
                                positioning: 'bottom-center',
                                element: document.getElementById('poiMarker'),
                                stopEvent: false                                
                            });
            },                      
            myInteractions(mapInteractions)
            {
                return (mapInteractions) ? [] : '';
            },
            
            mapInit()
            {
                let This                =   this;
                let urlMap              =   CommonUtil.CONST_GPS_URL_NORWAY_MAP;
                let latitude            =   this.poi.latitude;
                let longitude           =   this.poi.longitude;                

                let geoInfo             =   JSON.parse(this.poi.geoJSON);

                    fetch(urlMap)
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function (text) {
                        let parser  =   new WMTSCapabilities();
                        var result = parser.read(text);
                        var options = optionsFromCapabilities(result, {
                                            layer: 'topo4',
                                            matrixSet: 'EPSG:3857',
                                        });
                    
                    let map = new Map({
                        layers: [
                            new TileLayer({
                                opacity: 1,
                                source: new WMTS(options),
                            }) ,                            
                            new VectorLayer({
                                source  :      new VectorSource({
                                                                    features : new GeoJSON({
                                                                                                dataProjection:"EPSG:4326", 
                                                                                                featureProjection:"EPSG:3857"}).readFeatures(geoInfo),
                                                }),
                                }),

                            ],
                        target: 'map-poi',
                        view: new View({
                            center: fromLonLat([longitude,latitude]),
                            zoom: 5,
                        }),
                        });
                    });

            }


    },

    mounted() {
        this.mapZoom    = CommonUtil.CONST_GPS_OBSERVATION_ZOOM;
        this.getPointOfInterest(this.$route.params.pointOfInterestId);
        this.initMap();
        //this.mapInit();
    }
}
</script>
