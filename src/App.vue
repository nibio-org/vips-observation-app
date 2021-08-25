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
    <main id="app" role="main" class="container">
    <div v-if="$root.sharedState.uuid">
      <router-view/>
    </div>
    <div v-else>
      <Welcome></Welcome>
    </div>
  </main>
</template>

<script>
import Welcome from '@/components/Welcome'
import CommonUtil from "@/components/CommonUtil";

export default {
  name: 'App',
  components : {
    Welcome
  },
  methods: {
	},
  mounted(){
    
    let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
    this.$root.sharedState.uuid = userUUID;

  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  margin-top: 60px;
}
</style>
