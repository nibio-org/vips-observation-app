<template>
    <div id='divImg'>
    <div v-if=isImageVisible>
        <img src='' class="img-thumbnail float-left" ref="image"/>
    </div>
    <div v-else>
         <button type="button" class="btn btn-primary" id="cameraLauncher" ref='cameraLauncher' @click="launchCamera">{{ take_photo }}</button>
    </div>
    <common-util ref="CommonUtil"/>
    </div>

</template>

<script>
import CommonUtil from '@/components/CommonUtil'

export default {
    name        :   'Photo',
    components  :   {CommonUtil},
    props       :   ['observationId','organismId','imageFileName','isImageVisible'], 
    data ()  {
                return {
                    take_photo          : "Ta bilde",
                    dbIndexPhoto        :   '',
                    entityName          :   '',
                    observationImages   :   [],
                    observationImage    :   {
                                                observationId               :   '',
                                                organismId                  :   '',
                                                illustration                :   {
                                                                                    fileName        : '',
                                                                                    imageTextData   : '', 
                                                                                    deleted         : false
                                                                                } 
                                            },
                }
    },
    methods     : {
                    onfail: function(message) {
                        alert(message);
                    },
                    renderPhoto: function(imageURI) {
                        this.searchDBByindex('observationId',this.observationId,this.organismId,imageURI);

                    },
                     launchCamera: function() {
                        if(navigator.camera)
                        {
                            console.info("The camera should launch now");
                            navigator.camera.getPicture(this.renderPhoto, this.onFail, { 
                                quality: 50,
                                destinationType: Camera.DestinationType.DATA_URL, //FILE_URI
                                correctOrientation: true
                            });
                        }
                        {
                            console.log('WARNING : Functional Cordova plugin needed to launch camera');
                        }
                    },
                    fetchFromServer()
                        {
                            let photoURL=this.CONST_URL_DOMAIN+CommonUtil.CONST_URL_STATIC_IMAGE_PATH+this.organismId+'/'+this.imageFileName;
                            let imgTest;
                            let This = this; 
                            if(this.organismId)
                            {
                            const toDataURL = url => fetch(url)
                                .then(response => response.blob())
                                .then(blob => new Promise((resolve, reject) => {
                                    const reader = new FileReader()
                                    reader.onloadend = () => resolve(reader.result)
                                    reader.onerror = reject
                                    reader.readAsDataURL(blob)
                                }))


                                toDataURL(photoURL) 
                                .then(imageTextData => {
                                    This.observationImage.illustration.imageTextData = imageTextData;
                                        //console.log ('imageTextData : ',imageTextData);
                                        This.storeData(This.observationImage);
                                })
                            }

                        },
                        async storeData(observationImage)
                        {       let This    =   this;
                           
                            let dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                            dbRequest.onsuccess = function(evt) {
                                let db = evt.target.result;
                                if(db.objectStoreNames.contains(This.entityName)){
                                    let transaction = db.transaction([This.entityName],'readwrite'); 
                                    let objectstore = transaction.objectStore(This.entityName).add(observationImage,observationImage.illustration.fileName);
                                }
                                else
                                {
                                   let store = db.createObjectStore(This.entityName, {keypath : observationImage.illustration.fileName});
                                    store.createIndex('observationId', 'observationId', { unique: false });
                                    store.createIndex('organismId', 'organismId', { unique: false });                                    
                                }
                            } 
                            

                            dbRequest.onupgradeneeded= function (event)
                            {
                                let db = event.target.result;
                                if( !db.objectStoreNames.contains(This.entityName)){
                                   let store = db.createObjectStore(This.entityName, {keypath : observationImage.illustration.fileName});
                                    store.createIndex('observationId', 'observationId', { unique: false });
                                    store.createIndex('organismId', 'organismId', { unique: false });
                                }
                            }

                            this.getImageFromStore();

                        },
                       async getImageFromStore()
                        {
                             let This = this;
                                 let dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                                    dbRequest.onsuccess = function(evt) {
                                        let db = evt.target.result;
                                            let transaction = db.transaction([This.entityName],'readwrite');  
                                            let objectstore = transaction.objectStore(This.entityName);

                                            if(This.observationImage.illustration.fileName)
                                            {
                                                let objectstoreRequest = objectstore.get(This.observationImage.illustration.fileName);
                                                
                                                objectstoreRequest.onsuccess = function(event)
                                                {
                                                    let observationImage = event.target.result;
                                                    This.displayImage(observationImage.illustration.imageTextData);
                                                }
                                            }
                                            else{
                                                console.log(This.observationImage);
                                            }

                                     }



                        },
                         displayImage(imgTextData)
                        {
                            let image = null;
                            if(this.$refs.image)
                            {
                                 image = this.$refs.image;
                            }
                            else{
                                console.log('inside display image');
                                
                                image = document.createElement('img');
                               let imgSrc = document.createAttribute('src');
                               let att = document.createAttribute("class");
                                    att.value = "img-thumbnail float-left"; 
                                    image.setAttributeNode(att);

                               let divImg = document.getElementById("divImg");
                               divImg.appendChild(image);

                        }
                            image.width = CommonUtil.CONST_IMAGE_WIDTH;
                            image.height = CommonUtil.CONST_IMAGE_HEIGHT;
                            image.src=imgTextData;

                        },

                         searchDBByindex(indexName,indexValue,organismId,imageTextData,storeImage)
                        {

                             let This = this;
                             let dbRequest =  indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                             dbRequest.onsuccess = function(evt) {
                                 let db = evt.target.result;
                                 let transaction    =   db.transaction([This.entityName],'readwrite'); 
                                 let objectstore    =   transaction.objectStore(This.entityName);
                                 let indexStore     =    objectstore.index(indexName);
                                 let keyRange       =   IDBKeyRange.only(indexValue);
                                 let observationImages = [];
                                  indexStore.openCursor(keyRange).onsuccess = function(event) {
                                     let cursor = event.target.result;
                                     if(cursor)
                                     {
                                         observationImages.push(cursor.value);
                                         
                                         cursor.continue();
                                     }

                                     
                                 }
                                 
                                 transaction.oncomplete = function(){
                                    This.storeImage(observationImages,indexValue,organismId,imageTextData);
                                 }
                                 
                             }
                             
                            
                            
                        },

                        storeImage(observationImages,indexValue,organismId,imageTextData)
                        {
                            let selectedFileFirstName   =   '';
                            let selectedFileName        =   '';

                            let observation             =   {};
                            let illustration            =   {};
                            if(observationImages)
                            {
                                
                                let len = observationImages.length;
                                selectedFileFirstName=indexValue+'_illustration'+'_'+(len+1);
                                
                            }
                            else
                            {
                                selectedFileFirstName=indexValue+'_illustration';
                            }

                            observation.observationId           = indexValue;
                            observation.organismId              = organismId;
                            
                            illustration.deleted    = false;
                            illustration.fileName   = selectedFileFirstName+'.jpg';
                            illustration.imageTextData   = "data:image/jpeg;base64,"+imageTextData;
                            observation.illustration = illustration;
                            
                            this.observationImage = observation;

                            this.addImageIntoObservation(observation);
                            this.storeData(observation);
                            
                            
                        },

                        addImageIntoObservation(observation)
                        {
                            let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
                             if(observation.observationId)
                             {
                                 $.each(lstObservations, function(index, jobservation)
                                 {
                                        if(jobservation.observationId === observation.observationId)
                                        {
                                            if(jobservation.observationIllustrationSet && jobservation.observationIllustrationSet.length != 0)
                                            {
                                                let observationIllustrationSet = [];
                                                let findRecord = false;
                                                $.each(jobservation.observationIllustrationSet, function(index, illustration)
                                                {
                                                    if(illustration.observationIllustrationPK.fileName === observation.illustration.fileName)
                                                    {
                                                        findRecord = true;
                                                        return false;
                                                    }
                                                })
                                                if (!findRecord)
                                                {
                                                    let illustration = {};
                                                    let observationIllustrationPK = {};
                                                        observationIllustrationPK.observationId = observation.observationId;
                                                        observationIllustrationPK.fileName = observation.illustration.fileName;

                                                        illustration = {'observationIllustrationPK' : observationIllustrationPK, 'uploaded':false};
                                                    jobservation.observationIllustrationSet.push(illustration);
                                                    return false;
                                                    
                                                }
                                            }
                                        }
                                 });
                             }

                             localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(lstObservations));

                        }






    },
    mounted(){
                    this.CONST_URL_DOMAIN                       = this.$refs.CommonUtil.getDomain();
                    this.entityName                             = CommonUtil.CONST_DB_ENTITY_PHOTO;

                    this.observationImage.observationId         =   this.observationId;
                    this.observationImage.organismId            =   this.organismId;
                    this.observationImage.illustration.fileName =   this.imageFileName;      


                    if(this.organismId)
                    {
                        //this.fetchFromServer();
                        this.getImageFromStore();
                    }
    }    
}
</script>