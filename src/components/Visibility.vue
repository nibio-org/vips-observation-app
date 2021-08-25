 <!--
    
    This file is part of VIPS Observation App
 
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
    
    Copyright (c) 2021 NIBIO <http://www.nibio.no/>
    
    Author : Bhabesh Bhabani Mukhopadhyay
    Email : bhabesh.mukhopadhyay@nibio.no
    Dated : 19-Aug-2021
    
-->
<template>
    <select v-model=visibilityId ref='visibility' v-show="isMounted" v-on:change="selectVisibility($event)">
            <option v-for="privacy in visibilities" v-bind:value="privacy.value" v-bind:key="privacy.value">{{privacy.name}}</option>
    </select>
</template>
<script>
import CommonUtil from '@/components/CommonUtil'
export default {
    props : ['locationIsPrivate','polygonService'],
    data() {
        return {
                    isMounted    : false,
                    visibilities : [
                        {name: 'Select Visibility', value:'undefined'},
                        {name: 'Private', value:3},
                        {name: 'Public', value:4},
                    ],
                    visibilityId : 'undefined'
        }
        
    },
    methods : {
            buildVisibilities() {
                let This    = this;
                let polygons = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_VISIBILITY_POLYGON));
                $.each(polygons, function(index, data){
                
                    let polygon = {};
                    polygon.name    =   data.polygonServiceName;
                    polygon.value   =   data.polygonServiceId;

                    This.visibilities.push(polygon)

                })

                if(this.locationIsPrivate)
                {
                    this.visibilityId = 3; // Private = 3 check data()
                }
                else
                {
                    if(this.polygonService)
                    {
                        this.visibilityId = this.polygonService.polygonServiceId;
                    }
                    else
                    {
                        this.visibilityId = 4; // Public = 4 check data()
                    }
                    
                    
                }

                this.isMounted = true;
                
            },
            selectVisibility(event){
                let paramPrivate        = false;
                let paramPolygonService = '';
                let polygons            = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_VISIBILITY_POLYGON));
                let polygon = polygons.find(({polygonServiceId})=> polygonServiceId === parseInt(event.target.value));
            
                    if(event.target.value)
                    {
                        switch(parseInt(event.target.value))
                        {
                            case 1 :
                                paramPolygonService=polygon;
                                break;
                            case 2 :
                                paramPolygonService=polygon;
                                break;
                            case 3 :
                                paramPrivate=true;
                                break;
                            case 4 :
                                break;
                            default :
                                console.log('Selected option is beyond the range');                                                                                                
                        }

                    }
                    this.$emit('visibilityMapAction', paramPrivate, paramPolygonService);
            },
    },
    mounted () {
        this.buildVisibilities();
    }
    
}
</script>