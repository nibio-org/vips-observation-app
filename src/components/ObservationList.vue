import { DateTime } from "luxon";
<template>
<div>
  <div class="hello" >
    <h1>{{ $t("startpage") }}</h1>
    <router-link to="/observation" custom v-slot="{ navigate }">
      <button type="button" class="btn btn-primary" @click="navigate">+</button>
    </router-link> 
  </div>
  
  <div v-if="observations">
  <ul class="list-group">
       <router-link :to="{name: 'Observation', params: {observationId:obs.observationId}}" class="list-group-item list-group-item-action " v-for="obs in observations" v-bind:key="obs.observationId">

        {{ obs.timeOfObservation | dateFormat }}  <b>{{obs.observationHeading}}</b> 
    </router-link >

  </ul>
  </div>
  <div v-else class="alert alert-warning" role="alert">
      <p class="text-danger">You don't have any observations.</p>
  </div>
  <common-util ref="CommonUtil"/>
</div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import { DateTime } from 'luxon'

export default {
  name: "ObservationList",
  data() {
    return {
      /*msg: 'Startsiden'*/
      CONST_URL_DOMAIN  : '',
      observations      : undefined,
    };
  },
  components : {CommonUtil},
  methods : {
        /** TODO
         *  This function need to be shifted for two way sync process
         */
        fetchFromServer()
        {
            let strUUID     = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
            let jsonHeader  = { Authorization: strUUID };

            fetch(this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_USER_OBSERVATION_LIST, {
                method: "GET",
                headers: jsonHeader,
              }).then((response) => response.json())
                .then((data) => { 
                  localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(data));
                  this.getObservationsFromStore();
                })
        },
        getObservationsFromStore()
        {
          let strObservations = localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST);
          let lstObservations = JSON.parse(strObservations);
          this.observations = lstObservations;
        },


  },
  filters: {
    dateFormat: function(timeStr) {
      //return DateTime.fromISO(timeStr).toISODate();
      return DateTime.fromISO(timeStr).toLocaleString(DateTime.DATETIME_MED);
    }
  },
  mounted()  {
              this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
              let strUUID     = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
              if(strUUID)
              {
                //this.fetchFromServer(); // TODO - Tobe shifted to two way Sync process
                this.getObservationsFromStore(); // TODO -- to be in effect after two sync in process
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