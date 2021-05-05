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
        console.log('locationIsPrivate :: '+this.locationIsPrivate);
        this.buildVisibilities();
    }
    
}
</script>