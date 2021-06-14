<template>
    <div>
            <router-link id='btnBack' :to="{name:'PlacesList', params: {}}" class="btn btn-success">Back</router-link>
            <button id='map-mylocation' class="border border-primary rounded-circle" v-on:click="myposition"><i class='fas fa-crosshairs'></i></button>
            <div id='map-poi' style="border: 2px solid green;height: 400px;"></div>

            <div id='divPoiData' class="container" >
                <div ><input id='poiName' ref='poiName' v-model="poi.name"/></div>
                <div class="clearfix"/>
                <div class='row'>
                    <div class='col-7'>
                        <select v-model="poi.pointOfInterestTypeId">
                            <option v-for="poiType in poiTypes" v-bind:key="poiType.point_of_interest_type_id" :value='poiType.point_of_interest_type_id'>{{poiType.default_name}}</option>
                        </select>
                    </div>
                    <div class="col-2">
                        <button class="btn btn-success" @click="validate">Save</button>
                    </div>
                    <div class="col-3">
                        <button v-show="isDeleteBttnVisible"  class="btn btn-danger " v-on:click="callForRemovePOI"> Delete </button>
                    </div>
                </div>
            </div>
            <div id="poiMarker" style="display:none">
                <img src="@/assets/map_icon.png"> 
            </div>
            <!-- For Saving -->
            <Modal
                    v-show="isModalVisible"
                    v-on:close="closeModal"
                    v-on:action="actionModal"
            >
                <template v-slot:header>
                    !! ALERT !!
                </template>

                <template v-slot:body>
                    Saving information for : {{poi.name}} ?
                </template>

                <template v-slot:footer>
                    Please chose the option below :
                </template>

            </Modal>
            <!-- For Delete -->
            <Modal
                    v-show="isModalDelVisible"
                    v-on:close="closeDelModal"
                    v-on:action="actionDelModal"
            >
                <template v-slot:header>
                       !! ALERT !!
                </template>

                <template v-slot:body>
                        <font color='red'><b> DELETE </b> information for : {{poi.name}} ?</font>
                </template>

                <template v-slot:footer>
                    Please chose the option below :
                </template>

            </Modal>

            <modal-simple
                v-show="isModalSimpleVisible" 
                v-on:close="closeModal"           
            >
                <template v-slot:header>
                    !! ERROR !!
                </template>

                <template v-slot:body>
                    {{msgErr}} 
                </template>

                <template v-slot:footer>
                   &nbsp;
                </template>            
            </modal-simple>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil';
import Modal from '@/components/Modal';
import ModalSimple from '@/components/ModalSimple.vue';
import '@fortawesome/fontawesome-free/js/all.js'

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
    name        :   'MapPOI',
    components  :   {Modal,ModalSimple},
    props       :   ['pointOfInterestId'],

    data()      {
                    return {
                        isDeleteBttnVisible     :   true,
                        isModalDelVisible       :   false,
                        isModalVisible          :   false,
                        isModalSimpleVisible    :   false,
                        poi                     :   {},
                        mapZoom                 :   0,
                        poiTypes                :   [],
                        msgErr                  :   '',
                        map                     :   '',
                        
                        
                    }
    },
    methods :   {
                callForRemovePOI()
                {
                    this.isModalDelVisible = true;
                },
                closeDelModal(){
                    this.isModalDelVisible = false;
                },
                actionDelModal()
                {
                    if(this.poi.pointOfInterestId)
                    {
                        if(this.poi.pointOfInterestId < 0)
                        {
                             /** Just remove it locally */
                            this.removeLocalPOI(this.poi.pointOfInterestId);
                            this.$router.replace({path:'/places'});
                        }
                        else
                        {
                            /** Mark the record - for sending to server */
                            this.poi.deleted=true;
                            this.saveToStore();
                        }
                        
                    }

                     this.isModalDelVisible = false;
                },
                removeLocalPOI(id)
                {
                        let lstPOI = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                        let indexPosition       = null;
                        $.each(lstPOI, function(index, poi){
                            if(poi.pointOfInterestId===id)
                            {
                                indexPosition = index;
                                return false;
                            }
                        }); 

                        if(indexPosition)
                        {

                            lstPOI.splice(indexPosition,1);
                            localStorage.setItem(CommonUtil.CONST_STORAGE_POI_LIST,JSON.stringify(lstPOI));

                        }                        
                        
                },
                validate()
                {
                    if((!this.poi.name) || (this.trimString(this.poi.name) === '')) 
                    {
                        this.msgErr = 'Name should not be empty';
                        this.isModalSimpleVisible = true;
                    }else 
                    {
                        if ((!this.poi.pointOfInterestTypeId) )
                        {
                            if(this.poi.pointOfInterestTypeId === 0) 
                            {
                                this.isModalVisible         = false;
                                this.showModal();
                            }
                            else
                            {
                            this.msgErr = 'Type should not be empty';
                            this.isModalSimpleVisible = true;
                            }
                        }
                        else
                        {
                        this.isModalVisible         = false;
                        this.showModal();
                        }
                    }
                },
                showModal() {
                    this.isModalVisible = true;
                },        
                closeModal() {
                    this.isModalVisible         = false;
                    this.isModalSimpleVisible   =  false;
                },
                actionModal() {
                            this.isModalVisible = false;
                            this.saveToStore();
                },        
                getPointOfInterest(id){
                    let lstPOI  =   JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                    let poi     =   lstPOI.find(({pointOfInterestId}) => pointOfInterestId === id);
                    
                    this.poi    =   poi;

                },
                saveToStore(){
                    let This    =   this;
                    let lstPOI  =   JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_POI_LIST));
                    if(this.poi.pointOfInterestId)
                    {
                    $.each(lstPOI, function(index, poi){
                            if(poi.pointOfInterestId === This.poi.pointOfInterestId)
                            {
                                poi.latitude=This.poi.latitude;
                                poi.longitude=This.poi.longitude;
                                poi.name=This.poi.name;
                                poi.pointOfInterestTypeId=This.poi.pointOfInterestTypeId;
                                poi.geoJSON=This.poi.geoJSON
                                poi.uploaded=false;
                                if(This.poi.deleted)
                                {
                                    poi.deleted = This.poi.deleted;
                                }
                               
                            }
                    })
                    }
                    else
                    {
                        this.poi.pointOfInterestId = this.getNewPoiId(lstPOI);
                        this.poi.uploaded=false;
                        if(lstPOI)
                        {
                            lstPOI.push(this.poi);
                        }
                        else
                        {
                            lstPOI = [];
                            lstPOI.push(this.poi);
                        }
                        
                    }
                    localStorage.setItem(CommonUtil.CONST_STORAGE_POI_LIST,JSON.stringify(lstPOI));
                    this.$router.replace({path:'/places'});
                },
                /** new POI pointOfInterestId */
                getNewPoiId(lstPOI)
                {
                    let newId = 0;
                    let poiIds=[];
                    
                    
                    if(lstPOI)
                    {
                        $.each(lstPOI, function(index, poi){
                            if(poi.pointOfInterestId < 0)
                            {
                            poiIds.push(Math.abs(poi.pointOfInterestId));
                            }
                        });
                        if(poiIds.length === 0)
                        {
                        newId = CommonUtil.CONST_POI_COUNT_START_ID;
                        }
                        else
                        {
                        let largestValue = Math.max.apply(null, poiIds);
                        newId = -Math.abs(largestValue + 1);
                        }
                    }
                    else
                    {
                        newId = CommonUtil.CONST_POI_COUNT_START_ID;
                    }

                    return newId;
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
            
            /** My current location */
            myposition()
            {
                let options = { enableHighAccuracy: true };
                navigator.geolocation.getCurrentPosition(this.geolocationSuccess, this.geolocationError, options);
                //navigator.geolocation.getCurrentPosition(this.geolocationSuccess, this.geolocationError, this.geolocationOptions);

                
            },

            geolocationOptions(options){
                console.log('geolocation options : '+options);
            },
            geolocationError(error){
                console.log('geolocation error : '+geolocationError);
            },

            geolocationSuccess(pos) {
                      let This = this;
                    This.poi.latitude = pos.coords.latitude;
                    This.poi.longitude = pos.coords.longitude;
                    let coord = [pos.coords.longitude,pos.coords.latitude];
                    let   transFormCord =       transform(coord, 'EPSG:3857','EPSG:4326');

                    let vectorLayer     =       new VectorLayer({
                                                        source  : new VectorSource ({
                                                                        features    :   [
                                                                                            new Feature({
                                                                                                geometry : new Point(fromLonLat(transFormCord))
                                                                                            })
                                                                                        ],
                                                                }),
                                                        style   : new Style({
                                                                            image : new CircleStyle ({
                                                                                                        radius  :   5,
                                                                                                        fill    :   new Fill({
                                                                                                                            color : 'red'
                                                                                                                    }),
                                                                                                        stroke  :   new Stroke({
                                                                                                                            color   : 'red',
                                                                                                                            width   : 4
                                                                                                            })
                                                                                                    })
                                                                    })
                                                });

                        let     geoGSON         =   new GeoJSON();
                        let     resultGeoGSON   =   geoGSON.writeFeatures(vectorLayer.getSource().getFeatures());
                        this.poi.geoJSON        =   resultGeoGSON;                                                

                        if(this.map)
                        {
                            let mapLayers       =       this.map.getLayers();
                            mapLayers.forEach(function(layer){
                                let source  =   layer.get('source');
                                source.clear();
                            })
                        this.map.addLayer(vectorLayer); 
                        this.map.getView().setCenter(fromLonLat(coord));
                        this.map.getView().setZoom(CommonUtil.CONST_GPS_OBSERVATION_ZOOM);
                    }
            },

            mapInit()
            {

 


                let This                =   this;
                let urlMap              =   CommonUtil.CONST_GPS_URL_NORWAY_MAP;
                let latitude            =   this.poi.latitude;
                let longitude           =   this.poi.longitude;  
                let mapZoom             =   this.mapZoom;              

                let geoInfo             =   '';
                if(this.poi && this.poi.geoJSON)
                {
                    geoInfo = JSON.parse(this.poi.geoJSON);
                }
                else
                {
                    let image = this.myImage();
                    latitude = CommonUtil.CONST_GPS_DEFAULT_LATITUDE_02_NORWAY;
                    longitude = CommonUtil.CONST_GPS_DEFAULT_LONGITUDE_02_NORWAY;
                    mapZoom   = CommonUtil.CONST_GPS_DEFAULT_ZOOM;

                    let coord = [CommonUtil.CONST_GPS_DEFAULT_LONGITUDE_02_NORWAY,CommonUtil.CONST_GPS_DEFAULT_LATITUDE_02_NORWAY];
                    let   transFormCord =       transform(coord, 'EPSG:3857','EPSG:4326');
                    let iconFeature = new Feature({
                        geometry: new Point(fromLonLat(transFormCord)) 
                    }); 

                    let vectorSource      =   new VectorSource({});
                    vectorSource.addFeature(iconFeature);
                    let vectorLayer = new VectorLayer({
                        source: vectorSource,
                         style: new Style({
                                image: image,
                            }), 
                    });

                    let     geoGSON         =   new GeoJSON();
                    let     resultGeoGSON   =   JSON.parse(geoGSON.writeFeatures(vectorLayer.getSource().getFeatures()));
                            this.poi.geoJSON        =   JSON.stringify(resultGeoGSON);
                            geoInfo = resultGeoGSON;

                }

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
                    
                         This.map =   new Map({
                                            layers: [
                                                        new TileLayer({
                                                            opacity: 1,
                                                            source: new WMTS(options),
                                                        }) ,                            
                                                        new VectorLayer({
                                                                            source  :      new VectorSource({
                                                                                                                features : new GeoJSON({
                                                                                                                                            dataProjection:"EPSG:4326", 
                                                                                                                                            featureProjection:"EPSG:3857"
                                                                                                                                        }).readFeatures(geoInfo),
                                                                                            }),
                                                                            style   :       new Style({
                                                                                                        image: new CircleStyle({
                                                                                                                                    radius: 5,
                                                                                                                                    fill: new Fill({
                                                                                                                                                    color: '#FF0000'    //[180, 0, 0, 0.3]
                                                                                                                                                    }),
                                                                                                                                    stroke: new Stroke({color: 'red', width: 4}),
                                                                                                                                }),
                                                                                                        }),                                                
                                                                        }),

                                                ],
                                            controls    :   [],
                                            target      :   'map-poi',
                                            view        :   new View({
                                                                    center  : fromLonLat([longitude,latitude]),
                                                                    zoom    : mapZoom,
                                                            }),
                                    });

                        /** Remove map pointer for first time newly poi  */
                        if(!This.poi.longitude)
                        {

                            let mapLayers       =       This.map.getLayers();
                            mapLayers.forEach(function(layer){
                                let source  =   layer.get('source');
                                source.clear();
                            })
                        }

                                    This.map.on(['singleclick'],function(event){
                                        let   transFormCord =       transform(event.coordinate, 'EPSG:3857','EPSG:4326');
                                              This.poi.longitude    =   transFormCord[0];
                                              This.poi.latitude     =   transFormCord[1];

                                                                    This.map.getView().setCenter(fromLonLat(transFormCord));
                                    
                                        let mapLayers       =       This.map.getLayers();
                                            mapLayers.forEach(function(layer){
                                                let source  =   layer.get('source');
                                                source.clear();
                                            })

                                        let vectorLayer     =       new VectorLayer({
                                                                            source  : new VectorSource ({
                                                                                            features    :   [
                                                                                                                new Feature({
                                                                                                                    geometry : new Point(fromLonLat(transFormCord))
                                                                                                                })
                                                                                                            ],
                                                                                    }),
                                                                            style   : new Style({
                                                                                                image : new CircleStyle ({
                                                                                                                            radius  :   5,
                                                                                                                            fill    :   new Fill({
                                                                                                                                                color : 'red'
                                                                                                                                        }),
                                                                                                                            stroke  :   new Stroke({
                                                                                                                                                color   : 'red',
                                                                                                                                                width   : 4
                                                                                                                             })
                                                                                                                        })
                                                                                        })
                                                                    });

                                        This.map.addLayer(vectorLayer);

                                        let     geoGSON         =   new GeoJSON();
                                        let     resultGeoGSON   =   geoGSON.writeFeatures(vectorLayer.getSource().getFeatures(), {
                                                                        dataProjection      :   'EPSG:4326',
                                                                        featureProjection   :   'EPSG:3857'
                                                                    })
                                        This.poi.geoJSON        =   resultGeoGSON;
                                        
                                    })




                    });

            },
            trimString(param)
            {
                return param.replace(/\s*/g,"")
            }


    },
    filters: {
    
        trim: function(string) {
            return string.trim()
            }
    
    },
    mounted() {
        var appDiv                      =   document.getElementById("app");
        var navDiv                      =   document.getElementById("vipsobsappmenu");
        var mapDiv                      =   document.getElementById("map-poi");
            appDiv.style.marginTop      =   "0";
            appDiv.style.paddingRight   =   "0";
            appDiv.style.paddingLeft    =   "0"; 
            mapDiv.style.height         =   (screen.height - navDiv.offsetHeight) + "px"; 

            this.mapZoom                =   CommonUtil.CONST_GPS_OBSERVATION_ZOOM;
            this.poiTypes               =   JSON.parse(CommonUtil.CONST_POI_TYPES);

        if(this.$route.params.pointOfInterestId)
        {
            this.getPointOfInterest(this.$route.params.pointOfInterestId);
        }
        this.mapInit();
        
        
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
   html, body, #map-poi {
        margin: 0;
    width: 100%;
    }

    #btnBack{
        position: fixed;
        z-index: 1000;
    }
    #map-mylocation {
        position: fixed;    
        right: 0;
        z-index: 2000;
    }    
    #divPoiData {
        position: fixed;
        z-index: 1100;
        bottom: 0;
    }
</style>
