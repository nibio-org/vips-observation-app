<template>
    <div>
        <div class="divImg" :imgFile="imageFileName" >
            <div id="divPositionImg" class="float-left imagePosition" >
                <button class="close" type="button" @click="showModal">×</button>
                <img src=''  class="img-thumbnail border border-danger" ref="image"/>
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
    },
    mounted() {
        this.$refs.image.src=this.imageSource;
        this.$refs.image.width = CommonUtil.CONST_IMAGE_WIDTH;
        this.$refs.image.height = CommonUtil.CONST_IMAGE_HEIGHT;
    }
}
</script>
