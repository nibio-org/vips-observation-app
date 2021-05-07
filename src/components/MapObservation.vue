<template>
    <div>
    <div id='map-observation'>
        <div v-if="isMyMapPanelVisible"><router-link id='btnBack' :to="{name: 'Observation', params:{observationId:myObservationId, paramGeoinfo:myGeoInfo, paramObservation:mapObservation}}" class="btn btn-success ">Back</router-link></div>
        <div v-if="isMyMapPanelVisible" id='map-mylocation'>
            <button class="border border-primary rounded-circle" v-on:click="myposition"><i class='fas fa-crosshairs'></i></button>
        </div>
    </div>

    

    <div id="ObservationMapPanel" v-if="isMyMapPanelVisible" ref='ObservationMapPanel'> 
        <div>
<!--             <input value="" placeholder="name">

            <br> -->
            <select v-model="poi.pointOfInterestId" v-on:change="selectPOI($event)" ref="dropDownPOI">
                <option v-for="poi in lstPOI" v-bind:value="poi.pointOfInterestId" >{{poi.name}}</option>
            </select>
            <div id="poiMarker">
                <img src="@/assets/map_icon.png"> 
            </div>
<!--             <br>
            <select>
                <option>Select test 2</option>
            </select> -->
        </div>
    </div>
    <div v-else >
        <div id='divPrivacy' ref='divPrivacy'>
                <visibility :locationIsPrivate="locationIsPrivate" :polygonService="polygonService" v-on:visibilityMapAction="visibilityMapAction"/>
        </div>
    </div>
    <common-util ref="CommonUtil"/>
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
import Visibility from '@/components/Visibility'



let parser = new WMTSCapabilities();


export default {
     name : 'MapObservation',
     props : ['observationId','geoinfo','isMapPanelVisible','locationPointOfInterestId','locationIsPrivate','polygonService','observation'],
     components : {CommonUtil,Visibility},
     data(){
         return {
                    CONST_URL_DOMAIN    :   '',
                    isMyMapPanelVisible :   '',
                    myGeoInfo           :   '',
                    latitude            :   0,
                    longitude           :   0,
                    mapZoom             :   0,
                    mapInteractions     :   '',
                    lstPOI              :   [],
                    poi                 :   {pointOfInterestId:'undefined',name:'Select POI'},
                    myMap               :   '',
                    myObservationId     :   '',
                    mapObservation      :   {},
             }
     },
     methods : {
             visibilityMapAction(paramPrivate, paramPolygonService){
                this.$emit('visibilityObservationAction', paramPrivate, paramPolygonService);
            },
            /** My current location */
            myposition()
            {
                let options = { enableHighAccuracy: true };
                navigator.geolocation.getCurrentPosition(this.geolocationSuccess, this.geolocationError, options);
                //navigator.geolocation.getCurrentPosition(this.geolocationSuccess, this.geolocationError, this.geolocationOptions);

                
            },         
            geolocationSuccess(pos) {
                    this.poi.pointOfInterestId='undefined';                    
                    this.longitude= pos.coords.latitude;
                    this.latitude = pos.coords.longitude;
                    let coord = [pos.coords.longitude,pos.coords.latitude];
                    let transFormCord =       transform(coord, 'EPSG:3857','EPSG:4326');
                    this.myMap.getView().setCenter(fromLonLat(coord));
                    

                    let myImage             = this.myImage();

                    let   vectorSource      =   new VectorSource({});
                    var iconFeature = new Feature({
                        geometry: new Point(fromLonLat(coord)) 
                    });                   
                    vectorSource.addFeature(iconFeature);
                    var vectorLayer = new VectorLayer({
                                        source: vectorSource,
                                        style: new Style({
                                               image: myImage,
                                            }),
                                    });                    
                    this.clearMapLayers();
                    this.myMap.addLayer(vectorLayer); 
                    this.myMap.getView().setZoom(CommonUtil.CONST_GPS_OBSERVATION_ZOOM);

                    let     geoGSON         =   new GeoJSON();
                    let     resultGeoGSON   =   geoGSON.writeFeatures(vectorLayer.getSource().getFeatures());
                            this.myGeoInfo  =   JSON.parse(resultGeoGSON);   
                        
                        


            },
            geolocationError(error){
                console.log('geolocation error : '+geolocationError);
            },

            initMap(myLatitude,myLongitude){
                //let thisMap           =   this.myMap;
                let pointOfInterestId   =   this.poi.pointOfInterestId;
				let This                = this;
                let urlMap              =   CommonUtil.CONST_GPS_URL_NORWAY_MAP;

                let myGeoInfo           =   this.myGeoInfo;
                let latitude            =   myLatitude;//this.latitude;
                let longitude           =   myLongitude;//this.longitude;
                let mapZoom             =   this.mapZoom;

                let image               =   this.myImage();

                
                let vectorSource        =   this.myVectorGeoSource();

                let vectorGeoLayer      =   this.myVectorGeoLayer(vectorSource,image);

                let mapInteractions     =   this.myInteractions(this.mapInteractions);

                let mapView             =   this.myView(latitude,longitude,mapZoom);


                let localIsMyMapPanelVisible = this.isMyMapPanelVisible; 
                let coordinate          =   [latitude,longitude];
                
                let pointMarker         =   this.myOverLay (coordinate);
                let pointMarkerCoord    =   this.myOverLayCoord(latitude,longitude);

            

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
                        

                    This.myMap =   new Map({
                                            layers: [

                                                    new TileLayer({
                                                        opacity : 1,
                                                        source : new WMTS(options),
                                                    }),
                                                    vectorGeoLayer

                                            ],
                                            controls: [],
                                            interactions : mapInteractions,
                                            
                                            target: 'map-observation',
                                            view : mapView,
                                            overlays: [pointMarkerCoord],
                                            renderer: 'canvas',
                                        });

                   
                   

                    This.myMap.on(['singleclick'],function(event){
                            if(localIsMyMapPanelVisible)
                            {
                                    
                                This.poi.pointOfInterestId='undefined';

                                let transFormCord = transform(event.coordinate,'EPSG:3857','EPSG:4326');
                                        This.latitude=transFormCord[0];
                                        This.longitude=transFormCord[1];
                                let mapNewCord = toStringXY(transform(event.coordinate,'EPSG:3857','EPSG:4326'),4);


                                /** Below code for image marker */
    /* 
                                This.myMap.addOverlay(pointMarker);
                                pointMarker.setPosition(fromLonLat(transFormCord));
    
                                let view =  new View ({
                                            center:fromLonLat(transFormCord),
                                            zoom : mapZoom
                                        }) 

                                This.myMap.setView(view);
                                vectorSource.clear();
    */
                                This.myMap.getView().setCenter(fromLonLat(transFormCord));

                                    /******* Below code for vector marker positioning */

                                 var iconFeature = new Feature({
                                        geometry: new Point(fromLonLat(transFormCord)) 
                                    });
                                    This.clearMapLayers();
                                    if(vectorSource){}
                                    else{
                                        vectorSource      =   new VectorSource({});
                                    }

                                    if(vectorSource)
                                    {
                                        vectorSource.addFeature(iconFeature);

                                        var vectorLayer = new VectorLayer({
                                                            source: vectorSource,
                                                            style: new Style({
                                                                    image: image,
                                                                }),
                                                        });

                                        This.myMap.addLayer(vectorLayer); 
                                    
                                        let geoGSON = new GeoJSON();
                                        let resultGeoGSON = geoGSON.writeFeatures(vectorLayer.getSource().getFeatures(), {
                                            dataProjection: 'EPSG:4326',
                                            featureProjection: 'EPSG:3857' 
                                        });

                                        This.myGeoInfo = JSON.parse(resultGeoGSON);

                                    }
                        }

                    });

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

        myVectorGeoLayer(vectorSource,image){
                return new VectorLayer({
                    source  :   vectorSource,
                    style   :   new Style({
                                        image: image,
                                    }),
                })
        },
        myView(latitude,longitude,mapZoom){
                    return new View ({
                                        center:fromLonLat([latitude, longitude]),
                                        zoom : mapZoom
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


        myOverLay(coordinates){
            return new Overlay({
                            position :  fromLonLat(coordinates) ,
                            positioning: 'bottom-center',
                            element: document.getElementById('poiMarker'),
                            stopEvent: false                                
                        });
        },


        myOverLayCoord(latitude,longitude)
        {
            let coordinate = [latitude,longitude];
            return this.myOverLay(coordinate);
        },


        myStyleFunction(styles,feature)
        {
            return styles[feature.getGeometry().getType()]; 
        },

        myInteractions(mapInteractions)
        {
            return (mapInteractions) ? [] : '';
        },

        getMyPointOfInterst(lstPOI)
        {
            let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
            let jsonHeader = { Authorization: userUUID };

            lstPOI.push({pointOfInterestId:'undefined',name:'No POI Selected'});

            fetch(this.CONST_URL_DOMAIN +CommonUtil.CONST_URL_USER_POI, 
            {
                method: "GET",
                headers: jsonHeader,
            }).then((response) => {
                    if(response.status == 200)
                    {
                       return response.json()
                    }
            })
            .then((jsonLstPOI) => {
                $.each(jsonLstPOI, function(index, poi){
                        let myPOI = poi;//{'pointOfInterestId':poi.pointOfInterestId,'name':poi.name,'longitude':poi.longitude, 'latitude':poi.latitude};
                        lstPOI.push(myPOI);
                })
                
            })
        },

        clearMapLayers()
        {
            let myLayers = this.myMap.getLayers();
            if(myLayers)
            {
                this.myMap.getLayers().forEach(function (layer){
                    let source = layer.get('source');
                    if(source)
                    {
                        source.clear();
                    }

                })
            }
        },
 
        selectPOI(event)
        {
            let myPOI =  this.poi;
            if(event.target.value != 0)
            {
            $.each(this.lstPOI, function(index, poi){
                    if ( poi.pointOfInterestId === JSON.parse(event.target.value))
                    {
                        myPOI=poi;
                        return false;
                    }
            })

            this.myGeoInfo = JSON.parse(myPOI.geoJSON);
            let coordinate = this.myGeoInfo.features[0].geometry.coordinates;
            this.latitude   =   coordinate[0];
            this.longitude  =   coordinate[1];
            
          

            let myImage             = this.myImage();
            let transFormCord       = [this.latitude,this.longitude];
            //let vectorSource        =   this.myVectorGeoSource();
            let   vectorSource      =   new VectorSource({});

            var iconFeature = new Feature({
                geometry: new Point(fromLonLat(transFormCord)) 
            });

            vectorSource.addFeature(iconFeature);

            var vectorLayer = new VectorLayer({
                                source: vectorSource,
                                style: new Style({
                                        image: myImage,
                                    }),
                            });

            this.clearMapLayers();
            this.myMap.addLayer(vectorLayer); 

            this.myMap.getView().setCenter(fromLonLat(coordinate));
            this.myMap.getView().setZoom(CommonUtil.CONST_GPS_OBSERVATION_ZOOM);
            }

            
             
        }

     },
     mounted() {
         
         this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
        this.latitude = CommonUtil.CONST_GPS_DEFAULT_LATITUDE_NORWAY;
        this.longitude = CommonUtil.CONST_GPS_DEFAULT_LONGITUDE_NORWAY;

        let routeParam=this.$route.params;
      
        // This ensures that the map fills the entire viewport
		var mapDiv      =   document.getElementById("map-observation");
		var navDiv      =   document.getElementById("vipsobsappmenu");
        var appDiv      =   document.getElementById("app");
        var panelObDiv = document.getElementById("ObservationMapPanel");
        var divPrivacy  =   document.getElementById("divPrivacy");

        if(routeParam.observation)
        {
            this.mapObservation = routeParam.observation;
        }

        if(routeParam.observationId)
        {
            this.myObservationId = routeParam.observationId;
        }
        if(this.observationId)
        {
            this.myObservationId = this.observationId;
        }

        if(routeParam.isMapPanelVisible)
        {
            this.isMyMapPanelVisible = routeParam.isMapPanelVisible;
            
        }
        if(this.isMapPanelVisible)
        {
            this.isMyMapPanelVisible = this.isMapPanelVisible;
        }


        if(this.isMyMapPanelVisible)
            {
                mapDiv.style.height = (screen.height - navDiv.offsetHeight) + "px";
                this.mapInteractions='';

                appDiv.style.marginTop="0";
                appDiv.style.paddingRight="0";
                appDiv.style.paddingLeft="0";      
                
                 this.getMyPointOfInterst(this.lstPOI);
            }
        else
        {
                mapDiv.style.height = 300 +"px";
                this.mapInteractions='interactions:[]';
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
            this.mapZoom    = CommonUtil.CONST_GPS_OBSERVATION_ZOOM;
        }
        else
        {
            this.mapZoom = CommonUtil.CONST_GPS_DEFAULT_ZOOM;
            //this.mapZoom = CommonUtil.CONST_GPS_OBSERVATION_ZOOM;
        }

       if(routeParam.locationPointOfInterestId)
       {
           this.poi.pointOfInterestId = routeParam.locationPointOfInterestId;
       }

        this.$nextTick(function () {
            this.initMap(this.latitude, this.longitude);
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
    
    #btnBack{
        position: fixed;
        z-index: 2000;
    }
    #map-mylocation {
        position: fixed;    
        right: 0;
        z-index: 2000;
    }
    
</style>