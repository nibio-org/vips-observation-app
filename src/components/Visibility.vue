<template>
    <select ref='visibility' v-show="isMounted">
            <option v-for="privacy in visibilities" v-bind:value="privacy.value">{{privacy.name}}</option>
    </select>
</template>
<script>
import CommonUtil from '@/components/CommonUtil'
export default {
    data() {
        return {
                    isMounted    : false,
                    visibilities : [
                        {name: 'Select Visibility', value:'undefined'},
                        {name: 'Private', value:3},
                        {name: 'Public', value:'4'},
                    ],
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
                this.isMounted = true;
                
            }
    },
    mounted () {
        this.buildVisibilities();
    }
    
}
</script>