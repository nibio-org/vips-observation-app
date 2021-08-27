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
<div>
  <div class="hello" >
    <h1>{{ $t("startpage") }}</h1>
    <router-link to="/observation" custom v-slot="{ navigate }">
      <button type="button" class="btn btn-primary" @click="navigate">+</button>
    </router-link> 
  </div>
  
  <div v-if="observations">
  <ul class="list-group" v-if="isInitialized">
       <router-link :to="{name: 'Observation', params: {observationId:obs.observationId}}" class="list-group-item list-group-item-action " v-bind:class="{'text-danger':obs.isNew, 'text-primary':obs.toUpload, 'text-secondary':obs.isDeleted}" v-for="obs in sortedObservations" v-bind:key="obs.observationId">
         <div v-if="obs.isDeleted">
            <strike>  {{ obs.timeOfObservation | dateFormat }}  <b>{{obs.observationHeading}}</b> </strike>
         </div>
         <div v-else>
           {{ obs.timeOfObservation | dateFormat }}  <b>{{obs.observationHeading}}</b>
         </div>
    </router-link >

  </ul>
  </div>
  <div v-else class="alert alert-warning" role="alert">
      <p class="text-danger">You don't have any observations.</p>
  </div>
  <common-util ref="CommonUtil"/>
  <sync ref="Sync" />
</div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import Sync from '@/components/Sync'
import { DateTime } from 'luxon'


export default {
  name: "ObservationList",
  data() {
    return {
      /*msg: 'Startsiden'*/
      isInitialized     : false,
      CONST_URL_DOMAIN  : '',
      observations      : undefined,
    };
  },
  components : {CommonUtil,Sync},
  methods : {
        /** Extract observations from localstorage */
        getObservationsFromStore()
        {
          this.isInitialized = true;
          if(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST))
          {
              let strObservations = localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST);
              let lstObservations = JSON.parse(strObservations);
                lstObservations.forEach(function(observation){
                    if(observation.uploaded==false)
                    {
                      if(observation.deleted)
                      {
                          observation.isDeleted = true;
                      }
                      else{
                            if(observation.observationId < 0)
                            {
                              observation.isNew = true;
                            }
                            else{
                              observation.toUpload = true;
                            }
                      }

                    }

                });
              this.observations = lstObservations;
          }

        },


  },
  computed : {
        sortedObservations : function() {
          this.observations.sort( (a,b) => {
              return new Date(b.timeOfObservation) - new Date(a.timeOfObservation);
          });

          return this.observations;
        }
  },
  filters: {
    dateFormat: function(timeStr) {
      //return DateTime.fromISO(timeStr).toISODate();
      return DateTime.fromISO(timeStr).toLocaleString(DateTime.DATETIME_MED);
    }
  },
  mounted()  {

              let valueObj = {"name":CommonUtil.CONST_STORAGE_OBSERVATION_LIST,"complete":false};
              //this.$refs.Sync.syncObservationSendPrepare(valueObj);
              this.CONST_URL_DOMAIN = CommonUtil.CONST_URL_DOMAIN;
              let strUUID     = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
              if(strUUID)
              {
                this.getObservationsFromStore(); 
              }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>