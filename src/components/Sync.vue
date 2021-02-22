<template>
    <div>
         <!-- -- Sync :  <div v-html="isSyncNeeded"></div> -->
    </div>
</template>

<script>
import CommonUtil from "@/components/CommonUtil";

export default {
  name: "Sync",
  props: {
        isSyncNeeded: Boolean
  },
  data() {
    return {
      strServerTimeStamp    : "",
      booIsSyncOneWayReady  : false,
      arrSyncOneWay         : [CommonUtil.CONST_STORAGE_CROP_CATEGORY],
    };
  },
/*   computed: {
      testSync : function(){
          console.log('computed : msg 1 from parent for sync : '+this.isSyncNeeded);
          return this.isSyncNeeded;
      }
  },
*/ 
  watch : {
        booIsSyncOneWayReady : 
        {
            immediate : true,
            handler (val, oldVal)
            {
                console.log ('booIsSyncOneWayReady : -- oldval : '+oldVal+' - newval : '+val);
                if(val)
                {
                    this.syncOneWay();
                }
            }
        }
      /*
      isSyncNeeded : 
        {
            immediate : true,
            handler (val, oldVal)
            {
                console.log('watch 1 - prop changed : newval : '+val+' - oldval : '+oldVal);
            },
        } 
  },
*/
  methods: {
    testFunction(){
        console.log('test child testFuntion');
    },
    fetchTimeStamp() {
      /** Fetch time stamp  */
      /** compare with time stamp */
      /** If needed stored the time stamp */
      /** Mark the flag for sync */

      fetch("http://vipslogic-local.no/rest/observation/organismsystemupdated")
        .then((response) => response.json())
        .then((data) => {
          this.strServerTimeStamp = data;
          console.log("timestamp received : " + this.strServerTimeStamp);
        });
    },

    isSyncOnewayNeeded(loggedUser)
    {
        if(!this.booIsSyncOneWayReady)
        {
            //this.syncOneWayEmptyProduct();
            //this.syncOneWayDifferentUser(loggedUser);
            //this.syncOneWayDifferentTimeStamp();
        }
    
    },

    /** Oneway Sync on empty products in store -- (e.g. first time) */
    syncOneWayEmptyProduct()
    {
        let booLocalIsSyncOneWayReady = false;
           if(!this.booIsSyncOneWayReady) {
            $.each(this.arrSyncOneWay, function(index, value){
                let strItem = localStorage.getItem(value);
                /** Check empty local storage  */
                if(typeof(strItem)==undefined || strItem == null || strItem === '')
                {
                    booLocalIsSyncOneWayReady = true;
                    return false; //break;
                }
            });
            this.booIsSyncOneWayReady = booLocalIsSyncOneWayReady;
         }
    },
    
    /** Oneway Sync For Different user login */
    syncOneWayDifferentUser(loggedUser)
    {
        if(!this.booIsSyncOneWayReady) {
            let userStored = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_USER_DETAIL));
            if (userStored.userId != loggedUser.userId)
            {
                this.booIsSyncOneWayReady = true;
            }
       }

    },

    /** Oneway sync for different timestamp (e.g. changes in server) */
    syncOneWayDifferentTimeStamp()
    {
        console.log('3');
        if(!this.booIsSyncOneWayReady) {
            console.log('33');
            let strStoreTimeStamp = localStorage.getItem(CommonUtil.CONST_STORE_TIMESTAMP);

                

                        fetch(
                                CommonUtil.CONST_URL_DOMAIN +CommonUtil.CONST_URL_LAST_TIMESTAMP,
                                {
                                    method:"GET",
                                    headers: jsonHeader,
                                } 
                        )
                        .then((response) => response.json())
                        .then((data) => 
                        {
                            
                            if(typeof(strStoreTimeStamp)==undefined || strStoreTimeStamp == null || strStoreTimeStamp === '')
                            {
                                    localStorage.setItem(CommonUtil.CONST_STORE_TIMESTAMP,JSON.stringify(data));
                                    this.booIsSyncOneWayReady = true;
                            }
                            else{
                                    let jsTimeStamp         = new Date (JSON.stringify(data));
                                    let dtStoreTimeStamp    = new Date(strStoreTimeStamp);
                                    
                                    if(jsTimeStamp !== dtStoreTimeStamp)
                                    {
                                        this.booIsSyncOneWayReady = true; 
                                        
                                    }
                                   
                            }
                        
                        });

        }
        console.log('333');
    },



  },
  mounted() {
    //this.fetchTimeStamp();
  },
};
</script>