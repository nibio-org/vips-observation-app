<template>
    <div>

        <router-link v-show="iseditable" :to="{name:'Observation', params:{observationId:observation_Id}}">Back</router-link>
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