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
        <!-- <router-link v-show="iseditable" :to="{name:'Observation', params:{observationId:observation_Id}}">Back</router-link> -->
       <div v-if="isMounted">
            <FormSchema :schema="observationDataSchema" v-model="observationData" @change="change"></FormSchema>
       </div>

    </div>
</template>
<script>
import CommonUtil from '@/components/CommonUtil'
import FormSchema from '@formschema/native'
export default {
    props: ['observationId','organismId','isEditable','schemaData'],
    components : {FormSchema},
    data(){
            return {
                isMounted : false,
                observation_Id : '',
                organism_id : '',
                iseditable  : true,
                observationDataSchema : {},
               observationData : {}
            }
    },
    methods : 
    {
        change(){
            this.$emit('updateQuntificationData',this.observationData);
        },
        initQuantification()
        {
            

            let pestList    =   JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_PEST_LIST));
            let pest        =   pestList.find(({organismId}) => organismId === this.organism_id);
            
            this.observationDataSchema = JSON.parse(pest.observationDataSchema);
            

        }
    },
    errorCaptured(err, vm, info) {
        console.log('err : '+err);
        console.log('vm : '+vm);
        console.log('info : '+info);
    },
    mounted(){
        this.isMounted = true;
        this.observation_Id = (this.observationId) ? this.observationId : this.$route.params.observationId;
        this.organism_id    = (this.organismId) ? this.organismId : this.$route.params.organismId;
        this.observationData = (this.schemaData) ? this.schemaData : (this.$route.params.schemaData) ? this.$route.params.schemaData:'';
       

        if(typeof(this.isEditable)==='undefined' )
        {
            this.iseditable = true;
        }
        else{
            this.iseditable = false;
        }

        this.initQuantification();

    },

}
</script>