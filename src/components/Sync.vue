<template>
    <div>
        <div v-if="loading">
            <div class="spinner-border text-success" role="status">
                
            </div> <span class="text-danger"> Data Loading...</span>
            <!-- -- Sync :  <div v-html="isSyncNeeded"></div> -->
        </div>
     <common-util ref="CommonUtil"/>
    </div>
</template>

<script>
import CommonUtil from "@/components/CommonUtil";

export default {
  name: "Sync",
  components : {CommonUtil},
  props: {
        isSyncNeeded: Boolean
  },
  data() {
    return {
      CONST_URL_DOMAIN      : '',
      booIsSyncOneWayReady  : false,
      arrSyncOneWay         :   [
                                    {"name":CommonUtil.CONST_STORAGE_CROP_CATEGORY,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_CROP_LIST,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_PEST_LIST,"complete":false}    ,
                                     {"name":CommonUtil.CONST_STORAGE_CROP_PEST_LIST,"complete":false}    ,
                                ],
      appUser               : {},
      loading               : false,
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
                if(val)
                {
                    this.loading = true;
                    /* Starting of Sync */
                    console.log('----- SYNC STARTED -----');
                    this.syncOneWay();
                }
                if(typeof(booIsSyncOneWayReady)==='undefined')
                {
                    this.loading = false;
                    /* refresh for next time */
                    this.refreshOneWaySyncItems();
                }
                if(typeof(booIsSyncOneWayReady)==false)
                {
                    this.loading = false;
                }
            }
        },
        
      /*
      isSyncNeeded : 
        {
            immediate : true,
            handler (val, oldVal)
            {
                console.log('watch 1 - prop changed : newval : '+val+' - oldval : '+oldVal);
            },
        }
     */ 
  },

  methods: {
    testFunction(){
        console.log('test child testFuntion');
    },
   
   /** One way Sync. Fetching the data from server and stored in local storage */
    syncOneWay(){
        if (this.booIsSyncOneWayReady)
        {
            let appUser = this.appUser;
            let funStorageSet = this.oneWaySyncStorageSet;
            
            if(typeof(appUser)==undefined || appUser == null || appUser === '')
            {
                // TODO if appUser is not available
            }
            else
             {       let strUrl =   '';
                     let This   =   this;
                    $.each(this.arrSyncOneWay, function(index, value){
                        switch(value.name) {
                            case CommonUtil.CONST_STORAGE_CROP_CATEGORY :
                                 strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_CROP_CATEGORY+appUser.organization_id;
                                break;
                            case CommonUtil.CONST_STORAGE_CROP_LIST :
                                 strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_CROP_LIST;
                                break;
                             case CommonUtil.CONST_STORAGE_PEST_LIST :
                                 strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_PEST_LIST+'?organizationId='+appUser.organization_id;
                                break;                           
                             case CommonUtil.CONST_STORAGE_CROP_PEST_LIST :
                                 strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_CROP_PEST_LIST;
                                break;  
                            default :
                        }

                        funStorageSet(value,strUrl);
                    });
             }
        }
    },

    /**  Writing server data to localstorage using sync */
    oneWaySyncStorageSet(value,strUrl)
    {
        
        fetch(strUrl)
        .then((response) => response.json())
        .then((data) => 
        {
            localStorage.setItem(value.name,JSON.stringify(data));
            value.complete=true;
            this.setOneWaySyncStatus(value);
        });
        
    },

    /** Set status whether the sync of items completed or not */
    setOneWaySyncStatus(itemValue)
    {
        let booFlag;
        /* Set the status - array value status set by reference */
        $.each(this.arrSyncOneWay, function(index,value){
            if(value.name === itemValue.name)
            {
                value.complete = itemValue.complete;
            }
        });

        /* Set the global flag  - to mark the end of sync*/
        $.each(this.arrSyncOneWay, function(index,value){
            if(value.complete===false)
            {
                booFlag = false;
            }
        });
        this.booIsSyncOneWayReady = booFlag;

    },

    /** Reset One way sync items */
    refreshOneWaySyncItems(){
        $.each(this.arrSyncOneWay, function(index,value){
            value.complete=false;
        })
        this.booIsSyncOneWayReady=false;
    },

    /** Deciding factor whether oneway should start or not */
    isSyncOnewayNeeded(loggedUser)
    {
        if(!this.booIsSyncOneWayReady)
        {
            this.syncOneWayEmptyProduct(loggedUser);
            this.syncOneWayDifferentUser(loggedUser);
            this.syncOneWayDifferentTimeStamp(loggedUser);
        }
    
    },

    /** Oneway Sync on empty products in store -- (e.g. first time) */
    syncOneWayEmptyProduct(appUser)
    {
        
        let booLocalIsSyncOneWayReady = false;
           if(!this.booIsSyncOneWayReady) {
            $.each(this.arrSyncOneWay, function(index, value){
                let strItem = localStorage.getItem(value.name);
                /** Check empty local storage  */
                if(typeof(strItem)==undefined || strItem == null || strItem === '')
                {
                    booLocalIsSyncOneWayReady = true;
                    
                    return false; 
                }
            });
            this.booIsSyncOneWayReady   =   booLocalIsSyncOneWayReady;
            this.appUser                =   appUser;
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
                this.appUser=loggedUser;
            }
       }

    },

    /** Oneway sync for different timestamp (e.g. changes in server) */
    syncOneWayDifferentTimeStamp(appUser)
    {
        if(!this.booIsSyncOneWayReady) {
            let strStoreTimeStamp = localStorage.getItem(CommonUtil.CONST_STORE_TIMESTAMP);

                let jsonHeader = {Authorization:appUser.userUuid};

                        fetch(
                                this.CONST_URL_DOMAIN +CommonUtil.CONST_URL_LAST_TIMESTAMP,
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
                                    this.appUser=appUser;
                            }
                            else{
                                    let jsonServerTimeStamp = data;
                                    let jsonStoredTimeStamp = JSON.parse(strStoreTimeStamp);
                                    let jsTimeStamp         = new Date (jsonServerTimeStamp.lastUpdated);
                                    let dtStoreTimeStamp    = new Date(jsonStoredTimeStamp.lastUpdated);

                                    if(jsTimeStamp.getTime() != dtStoreTimeStamp.getTime())
                                    {
                                        this.booIsSyncOneWayReady = true;
                                        this.appUser=appUser; 

                                        localStorage.setItem(CommonUtil.CONST_STORE_TIMESTAMP,JSON.stringify(data));

                                        
                                    }
                                   
                            }
                        
                        });

        }
    },



  },
  mounted () {
      this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
  }
 
};
</script>

