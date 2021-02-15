<template></template>

<script>
export default {
    name: "Sync",

    data() {
        return {
            strServerTimeStamp : ''
        }
    }, 
    methods:{
        fetchTimeStamp(){

                /** Fetch time stamp  */
                /** compare with time stamp */
                /** If needed stored the time stamp */
                /** Mark the flag for sync */

            fetch(
                "http://vipslogic-local.no/rest/observation/organismsystemupdated"
            )
            .then ((response) => response.json())
            .then((data) => {
                this.strServerTimeStamp = data;
                console.log('timestamp received : '+ this.strServerTimeStamp);
            })

        }
    },
    mounted(){
        this.fetchTimeStamp();
    }
}
</script>