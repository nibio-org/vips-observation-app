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
        <div class="divImg" :imgFile="imageFileName" >
            <div id="divPositionImg" class="float-left imagePosition" >
                <button class="close" type="button" @click="showModal">×</button>
                <img src=''  class="img-thumbnail border border-danger" @click='showModalPhoto' ref="image"/>
            </div>
        </div>  
         
            <Modal
                v-show="isModalVisible"
                v-on:close="closeModal"
                v-on:action="actionModal"
            >

                <template v-slot:header>
                    !! ALERT !!
                </template>

                <template v-slot:body>
                    {{imageFileName}} Image will be deleted !!
                </template>

                <template v-slot:footer>
                    Please chose the option below :
                </template>

            </Modal> 
    </div>
</template>

<script>
import Modal from './Modal.vue';
import CommonUtil from '@/components/CommonUtil'
export default {
  components: { Modal },
    name : 'PhotoTag',
    props : ['imageSource','imageFileName'],
    data() {
        return {
            isModalVisible      :   false,
            imgSrcData  :   '',
        }
    },
    methods : {

                    showModal() {
                        this.isModalVisible = true;
                    },
                    closeModal() {
                        this.isModalVisible = false;
                    },
                    actionModal() {
                        this.$emit('action', this.imageFileName);
                        this.isModalVisible = false;
                        
                    },
                    showModalPhoto()
                    {
                        this.$emit('showImage',this.imageFileName);
                    },
    },
    mounted() {
        this.$refs.image.src=this.imageSource;
        this.$refs.image.width = CommonUtil.CONST_IMAGE_WIDTH;
        this.$refs.image.height = CommonUtil.CONST_IMAGE_HEIGHT;
    }
}
</script>
