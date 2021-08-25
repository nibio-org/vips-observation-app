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
        <h2>{{$t($t("prop.welcome.header.text"))}}</h2>
            <center>
                <div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="static/css/images/nibio-logo-neg.png" alt="NIBIO-VIPS" style="background-color: gray;">
                    <div class="card-body">
                        <h5 class="card-title">{{$t("prop.welcome.login.success.text")}}</h5>
                        <p align="left" class="card-text d-flex justify-content-around">{{$t("prop.welcome.card.description.text")}}</p>
                        
                    </div>
                </div>        
            </center>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'

export default ({
   data()
   {
       return {
           isMounted : false,
           uuid : '',
       }
   },
   methods: {

   },
   mounted() {
       this.isMounted = true;
       //this.uuid = localStorage.getItem(localStorage.removeItem(CommonUtil.CONST_STORAGE_UUID));
       //console.log('uuid : '+this.uuid);

   }

   
})
</script>
