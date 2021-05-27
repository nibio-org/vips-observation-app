<template>
    <div>
        <div v-if="loading">
            <div class="spinner-border text-success" role="status">
                
            </div> <span class="text-danger"> Data Loading...</span>
            <!-- -- Sync :  <div v-html="isSyncNeeded"></div> -->
        </div>
     <div v-show="isMounted"><common-util ref="CommonUtil"/></div>
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
      isMounted             : false,
      CONST_URL_DOMAIN      : '',
      booIsSyncOneWayReady  : false,
      booIsSyncTwoWayReady  : false,
      arrSyncOneWay         :   [
                                    {"name":CommonUtil.CONST_STORAGE_CROP_CATEGORY,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_CROP_LIST,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_PEST_LIST,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_CROP_PEST_LIST,"complete":false}    ,
                                    {"name":CommonUtil.CONST_STORAGE_VISIBILITY_POLYGON,"complete":false}    ,
                                ],
      arrSyncTwoWay         :   [
                                    {"name":CommonUtil.CONST_STORAGE_OBSERVATION_LIST,"complete":false}    ,
                                    
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
                    console.log('----- SYNC ONE WAY STARTED -----');
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
        booIsSyncTwoWayReady    :
        {
            immediate : true,
            handler(val, oldVal)
            {
                if(val)
                {
                     this.loading = true;
                    console.log('----- SYNC TWO WAY STARTED -----');
                    this.syncTwoWayAtLogin();
                     this.loading = false;
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
                             case CommonUtil.CONST_STORAGE_VISIBILITY_POLYGON :
                                 strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_POLYGON_SERVICES+appUser.organization_id;
                                break;                                  
                            default :
                        }

                        funStorageSet(value,strUrl);
                    });
             }
        }
    },

    syncTwoWayAtLogin()
    {
        
            let appUser = this.appUser;
            let funStorageSet = this.oneWaySyncStorageSet;

             if(typeof(appUser)==undefined || appUser == null || appUser === '')
             {
                 // TODO if appUser is not available
             }
             else
             {
                 
                    this.syncTwoWay();
             }
    },
    syncTwoWay()
    {
            let strUrl =   '';
            let This = this;
            $.each(this.arrSyncTwoWay, function(index, value){
                 switch(value.name) {
                        case CommonUtil.CONST_STORAGE_OBSERVATION_LIST :
                            strUrl = This.CONST_URL_DOMAIN +CommonUtil.CONST_URL_USER_OBSERVATION_LIST;
                            
                            break; 
                        default :
                 }

                 This.syncTwoWayInitiate(value,strUrl);
            });
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


    syncTwoWayInitiate(value, strUrl)
    {
        
         switch(value.name)
         {
            case CommonUtil.CONST_STORAGE_OBSERVATION_LIST :
                
                this.syncTwoWayObservation(value,strUrl);
                break;
            default: 
         }
       
    },

    /** Two way Sync - Observation */
    syncTwoWayObservation(value,strUrl)
    {
        
        this.syncObservationSendPrepare(value);
    },

    /** Sync - Observation - embed with image data for POST */
    syncObservationSendPrepare(value)
    {
        let This = this;
        let lstObservations =   JSON.parse(localStorage.getItem(value.name));
        let entityName      =   CommonUtil.CONST_DB_ENTITY_PHOTO;
        lstObservations.forEach(function(observation) {
            let observationForStore = {};
            observationForStore.observationId               =   observation.observationId;               
            observationForStore.cropOrganismId              =   observation.cropOrganismId;
            observationForStore.organismId                  =   observation.organismId
            observationForStore.timeOfObservation           =   observation.timeOfObservation;
            observationForStore.statusChangedTime           =   observation.statusChangedTime;
            observationForStore.statusTypeId                =   observation.statusTypeId;
            observationForStore.isQuantified                =   observation.isQuantified;
            observationForStore.userId                      =   observation.userId;
            observationForStore.geoinfo                     =   observation.geoinfo;
            observationForStore.locationPointOfInterestId   =   observation.locationPointOfInterestId;
            observationForStore.broadcastMessage            =   observation.broadcastMessage;
            observationForStore.statusRemarks               =   observation.statusRemarks;
            observationForStore.observationHeading          =   observation.observationHeading;
            observationForStore.observationText             =   observation.observationText;
            observationForStore.observationData             =   observation.observationData; 
            observationForStore.locationIsPrivate           =   observation.locationIsPrivate;
            observationForStore.polygonService              =   observation.polygonService; 
            observationForStore.uploaded                    =   observation.uploaded;    
            observationForStore.observationIllustrationSet  =   observation.observationIllustrationSet;          

            This.syncObservationSendPrepareSingleObject(observationForStore);



        });
    },

    syncObservationSendPrepareSingleObject(observation,syncObservationPOST)
    {
            let This        =   this;
            let entityName  =   CommonUtil.CONST_DB_ENTITY_PHOTO;
            if(observation.uploaded == false)
            {
                let observationUpload = observation;
                let observationIllustrationSet = observationUpload.observationIllustrationSet;
                
                //  talk to Innodb,  embed image data to JSON POST and exit
                let dbRequest =  indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);                
                dbRequest.onsuccess = function(evt) {
                    let db = evt.target.result;
                    let transaction      =   db.transaction([entityName],'readwrite'); 
                    let objectstore      =    transaction.objectStore(entityName);
                    if(observationIllustrationSet)
                    {
                        observationIllustrationSet.forEach(function(illustration)
                        {
                                let fileName = illustration.observationIllustrationPK.fileName;
                                
                                let objectstoreRequest = objectstore.get(fileName);
                                
                                
                                objectstoreRequest.onsuccess = function(event)
                                {
                                    
                                    let observationImage = event.target.result;
                                        if(observationImage)
                                        {
                                            let imageTextData = observationImage.illustration.imageTextData;
                                            illustration.imageTextData=imageTextData;
                                        }
                                }
                        });
                    }

                    transaction.oncomplete = function() {
                        This.syncObservationPOST(observation);
                    }

                }
                //console.log('---------*******-----------');
                //console.log(observation);
                /** Send observation post data */

                

            }
    },
    syncObservationPOST(observation)
    {
        console.log(this.isSyncNeeded);
        //if(this.isSyncNeeded)
        {
            
            console.log('loading : '+this.loading);
            let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);

            let jsonBody = JSON.stringify(observation);
            console.log(jsonBody);
            fetch(
                    CommonUtil.CONST_URL_DOMAIN + CommonUtil.CONST_URL_SYNC_UPDATE_OBSERVATION,
                    {
                        method: "POST",
                        headers: {
                                    "Content-Type": "application/json",
                                    'Authorization' : userUUID
                        },
                        body : jsonBody
                    } 
                )
            .then(function(response){
                    return response.text()
            })
            .then((data)=>{
                console.log('-- Reading data --');
                //console.log(data);
                let updatedObservation = JSON.parse(data);
                console.log(updatedObservation);
                if(updatedObservation.observationId === observation.observationId)
                {
                    this.updateObservation(updatedObservation);
                    
                }
            });
        }
        
    },

    updateObservation(updatedObservation)
    {
            let lstObservation = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
            lstObservation.forEach(function(jsonObservation){
                if(jsonObservation.observationId === updatedObservation.observationId)
                {
                    jsonObservation = Object.assign({}, updatedObservation); // Deep cloning
                }

            });
    },





  },
  mounted () {
      console.log('mounted .. --');
      this.isMounted = true;
      this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
  }
 
};
</script>

