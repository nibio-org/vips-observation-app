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
