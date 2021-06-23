<template>
    <div>
       
        <div v-if=isImageVisible >
            <div v-if=isDeleted> </div>
            <div v-else>
                <div class='divImg' :imgFile='imageFileName'>
                    <div id='divPositionImg' class="float-left imagePosition" >
                        <button class="close" type="button" @click="showModal">×</button>
                        <img src=''  class='img-thumbnail border' v-bind:class="{ 'border-primary' : isBorderUploaded}" ref="image"  @click='showModalPhoto'/>
                    </div>
                </div>
            </div>
        </div>
        <div v-else >
            <div class="row">
                <div ><button type="button" class="btn btn-primary" id="cameraLauncher" ref='cameraLauncher' @click="launchCamera">{{ take_photo }}</button></div>
                 &nbsp;
                <div ><button type="button" class="btn btn-primary" id="cameraLauncher" ref='cameraLauncher' @click="launchGallary">{{ choose_photo }}</button></div>
            </div>
            <div class="row">
                <div v-for="divImage in divAddPhotos" v-bind:key="divImage">
                    <photo-tag :imageSource='divImage.illustration.imageTextData' :imageFileName='divImage.illustration.fileName' v-on:action="deleteImageByFileName" v-on:showImage="showModalPhoto"> </photo-tag>                
                </div> 
            </div>
        </div>
        

        <common-util ref="CommonUtil"/>
        <Modal
            v-show="isModalVisible"
             v-on:close="closeModal"
             v-on:action="actionModal"
        >
    
        <template v-slot:header>
            !! ALERT !!
        </template>

        <template v-slot:body>
            {{observationImage.illustration.fileName}} Image will be deleted !!
        </template>

        <template v-slot:footer>
            Please chose the option below :
        </template>

        </Modal>

    <modal-photo :propImageSource='observationImage.illustration.imageTextData' v-show="isModalPhotoVisible" v-on:close="closeModalPhoto">
        <template v-slot:header>
            !! Observation Photo !!
        </template>
        <template v-slot:footer>
            -
        </template>
    </modal-photo>

    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import Modal from '@/components/Modal'
import PhotoTag from '@/components/PhotoTag.vue'
import ModalPhoto from './ModalPhoto.vue'


export default {
    name        :   'Photo',
    components  :   {CommonUtil, Modal,ModalPhoto,PhotoTag},
    props       :   ['observationId','organismId','imageFileName','isImageVisible','isDeleted','isUploaded'], 
    data ()  {
                return {
                    take_photo          : "Ta bilde",
                    choose_photo        :  "Choose Photo",
                    isModalVisible      :   false,
                    counterDiv          :   1,
                    divAddPhotos        :   [],
                    isModalPhotoVisible :   false,
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
                    isBorderUploaded    :   false,
                }
    },
    methods     : {
                    showModal() {
                        this.isModalVisible = true;
                    },
                    closeModal() {
                        this.isModalVisible = false;
                    },
                    actionModal() {

                        this.deleteImage(this.observationImage);
                        this.isModalVisible = false;
                        
                    },

                    showModalPhoto(fileName)
                    {
                                              
                        let imgFileName = '';
                        if(typeof(fileName)=== 'object')
                        {

                            imgFileName=this.observationImage.illustration.fileName;
                        }
                        else{
                            imgFileName = fileName;
                        }
                        this.isModalPhotoVisible = true;
                        this.getImageDataFromStore(imgFileName);
                    },
                    closeModalPhoto()
                    {
                        this.isModalPhotoVisible = false;
                    },

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
                                correctOrientation: true,

                            });
                        }
                        {
                            console.log('WARNING : Functional Cordova plugin needed to launch camera');
                        }
                    },
                    launchGallary : function() {
                        if(navigator.camera)
                        {
                            console.info("Other photo location should launch now");
                            navigator.camera.getPicture(this.renderPhoto, this.onFail, { 
                                quality: 50,
                                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                                destinationType: Camera.DestinationType.DATA_URL, //FILE_URI
                                correctOrientation: true,

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
                                     This.createEntity(db,This.entityName, observationImage.illustration.fileName);
/*                                    let store = db.createObjectStore(This.entityName, {keypath : observationImage.illustration.fileName});
                                    store.createIndex('observationId', 'observationId', { unique: false });
                                    store.createIndex('organismId', 'organismId', { unique: false });                                    
 */                                }
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
                        /** Create Entity */
                        createEntity(db,entityName, keyName)
                        {
                                
                                   let store = null;
                                   if(keyName)
                                   {
                                       store = db.createObjectStore(entityName, {keypath : keyName});
                                   }
                                   else
                                   {
                                       store = db.createObjectStore(entityName);
                                   }
                                    store.createIndex('observationId', 'observationId', { unique: false });
                                    store.createIndex('organismId', 'organismId', { unique: false }); 
                        },
                        /** Check requirement for DB upgrade */
                        async checkDBUpgrade(dbRequest,entityName, keyName){
                            dbRequest.onupgradeneeded= function (event)
                            {
                                let db = event.target.result;
                                console.log('test - 1');
                                if( !db.objectStoreNames.contains(entityName)){
                                    console.log('test - 2');
                                   let store = null;
                                   if(keyName)
                                   {
                                       console.log('test - 3');
                                       store = db.createObjectStore(entityName, {keypath : keyName});
                                   }
                                   else
                                   {
                                       console.log('test - 4');
                                       store = db.createObjectStore(entityName);
                                   }
                                   console.log('test - 5');
                                    store.createIndex('observationId', 'observationId', { unique: false });
                                    store.createIndex('organismId', 'organismId', { unique: false });
                                    console.log('test - 6');
                                }
                            }

                        },
                       async getImageFromStore()
                        {
                             let This = this;
                                 let dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                                    dbRequest.onsuccess = function(evt) {
                                        let db = evt.target.result;
                                        if(db.objectStoreNames.contains(This.entityName))
                                        {
                                            let transaction = db.transaction([This.entityName],'readwrite');  
                                            let objectstore = transaction.objectStore(This.entityName);

                                            if(This.observationImage.illustration.fileName)
                                            {
                                                let objectstoreRequest = objectstore.get(This.observationImage.illustration.fileName);
                                                
                                                objectstoreRequest.onsuccess = function(event)
                                                {
                                                    let observationImage = event.target.result;
                                                    if(observationImage)
                                                    {
                                                        if(observationImage.illustration.imageTextData)
                                                        {
                                                            This.displayImage(observationImage.illustration.imageTextData);
                                                        }
                                                    }
                                                    else{
                                                        console.log('Image filename mentioned in Observation, but no image data found');
                                                    }
                                                }
                                            }
                                            else{
                                                //console.log(This.observationImage);
                                            }

                                        }

                                     }

                        },
                        getImageDataFromStore(fileName)
                        {
                             let This = this;
                                 let dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                                    dbRequest.onsuccess = function(evt) {
                                        let db = evt.target.result;
                                        if(db.objectStoreNames.contains(This.entityName))
                                        {
                                            let transaction = db.transaction([This.entityName],'readwrite');  
                                            let objectstore = transaction.objectStore(This.entityName);

                                            if(This.observationImage.illustration.fileName)
                                            {
                                                let objectstoreRequest = objectstore.get(fileName);
                                                
                                                objectstoreRequest.onsuccess = function(event)
                                                {
                                                    let observationImage = event.target.result;
                                                    if(observationImage)
                                                    {
                                                        //This.displayImage(observationImage.illustration.imageTextData);
                                                        This.observationImage.illustration.imageTextData = observationImage.illustration.imageTextData;
                                                        
                                                    }
                                                    else{
                                                        console.log('Image filename mentioned in Observation, but no image data found');
                                                    }
                                                }
                                            }
                                            else{

                                            }

                                        }



                                     }
                        },

                        displayImage(imgTextData)
                        {
                            if(imgTextData)
                            {
                                let image = null;

                                if(this.$refs.image)
                                {
                                    image = this.$refs.image;
                                    
                                }
                                else{
                                    this.divAddPhotos.push(this.observationImage);

                            }
                                if(image)
                                {
                                    image.width = CommonUtil.CONST_IMAGE_WIDTH;
                                    image.height = CommonUtil.CONST_IMAGE_HEIGHT;
                                    image.src=imgTextData;
                                    if(this.isUploaded === false)
                                    {
                                        this.isBorderUploaded = true;
                                    }
                                }
                        }

                        },

                        /**  Search IndexedDB for available imaages within a observation */
                         searchDBByindex(indexName,indexValue,organismId,imageTextData,storeImage)
                        {
                             let This = this;
                             let dbRequest =  null;
                             if(indexValue===CommonUtil.CONST_OBSERVATION_COUNT_START_ID)
                             {
                                 dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                                 dbRequest.onsuccess = function(evt) {
                                        let db = evt.target.result;
                                            db.close();
                                 }
                                 

                                 let delReq = indexedDB.deleteDatabase(CommonUtil.CONST_DB_NAME);
                                 delReq.onerror = function()
                                 {
                                     console.log('could not delete database');
                                 }
                                 delReq.onblocked = function()
                                 {
                                     console.log('delete DB not successful because of operation block');
                                 }

                             }

                             dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);

                                        dbRequest.onupgradeneeded= function (event)
                                        {
                                            console.log('inside onupgrade');
                                            let db = event.target.result;


                                                db.onerror = function(event) {
                                                    note.innerHTML += "<li>Error loading database.</li>";
                                                    console.log(event);
                                                };

                                            //if( !db.objectStoreNames.contains(This.entityName)){
                                            let store = db.createObjectStore(This.entityName);
                                                store.createIndex('observationId', 'observationId', { unique: false });
                                                store.createIndex('organismId', 'organismId', { unique: false });

                                                store.transaction.oncomplete = function(event) {
                                                };
                                            //}
                                        }

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

                        /** Call back function for create image file name and storing image information and  data */
                        storeImage(observationImages,indexValue,organismId,imageTextData)
                        {
                            let selectedFileFirstName   =   '';
                            let selectedFileName        =   '';

                            let observation             =   {};
                            let illustration            =   {};
                            if(observationImages)
                            {
                                
                                let len = observationImages.length;
                                if(len === 0)
                                {
                                    selectedFileFirstName=indexValue+'_illustration';
                                }
                                else
                                {
                                    let arrFileNumber = [];
                                    $.each(observationImages, function(index, observation){
                                        let fileNumber  =   0;
                                        let fileName    =   observation.illustration.fileName;
                                        let pos01       =   fileName.indexOf('.');
                                        let pos02       =   fileName.lastIndexOf('n',pos01);
                                        let numberStr   =   fileName.substring(pos02+1,pos01);
                                        if(numberStr.substring(0,1)==='_')
                                        {
                                            fileNumber = parseInt(numberStr.substring(1));
                                        }
                                        else
                                        {
                                            fileNumber = 1;
                                        }
                                        arrFileNumber.push(fileNumber);

                                    })
                                    let maxNumber = Math.max.apply(null,arrFileNumber);

                                    selectedFileFirstName=indexValue+'_illustration'+'_'+(maxNumber+1);
                                }
                                
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
                            this.imageFileName = illustration.fileName;
                            //if(this.counterDiv != 1) 
                            {
                                this.counterDiv = this.counterDiv+1;
                            }
                            this.addImageIntoObservation(observation);
                            this.storeData(observation);
                            
                        },

                        /** Add image file name into localstorage */
                        addImageIntoObservation(observation)
                        {
                            let isRecordAvailable = false;
                            let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
                             if(observation.observationId)
                             {
                                 if(lstObservations)
                                 {
                                    $.each(lstObservations, function(index, jobservation)
                                    {
                                            if(jobservation.observationId === observation.observationId)
                                            {
                                                isRecordAvailable = true;
                                                let illustration = {};
                                                let observationIllustrationPK = {};
                                                    observationIllustrationPK.observationId = observation.observationId;
                                                    observationIllustrationPK.fileName = observation.illustration.fileName;

                                                    illustration = {'observationIllustrationPK' : observationIllustrationPK, 'uploaded':false};
                                                if(jobservation.observationIllustrationSet) {}
                                                else
                                                {
                                                    jobservation.observationIllustrationSet = [];
                                                }
                                                
                                                jobservation.observationIllustrationSet.push(illustration);
                                            }
                                    });
                                 }

                                 if(isRecordAvailable === false)
                                 {
                                    let observationNew = {};
                                    let illustration = {};
                                    let observationIllustrationPK = {};
                                        observationIllustrationPK.observationId = observation.observationId;
                                        observationIllustrationPK.fileName = observation.illustration.fileName;
                                        illustration = {'observationIllustrationPK' : observationIllustrationPK, 'uploaded':false};
                                        observationNew.observationId=observation.observationId;
                                        observationNew.organismId=observation.organismId;
                                        observationNew.observationIllustrationSet = [];
                                        observationNew.observationIllustrationSet.push(illustration);

                                    if(lstObservations) {}
                                    else
                                    {
                                        lstObservations = [];
                                    }
                                    lstObservations.push(observationNew);

                                 }
                             }

                             localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(lstObservations));

                        },
                        deleteImageByFileName(fileName)
                        {
                            let This = this;
                            let dbRequest =  indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                            dbRequest.onsuccess = function(evt) {
                                let db = evt.target.result;
                                let transaction    =   db.transaction([This.entityName],'readwrite'); 
                                let objectstore    =   transaction.objectStore(This.entityName);
                                let objectStoreRequest = objectstore.get(fileName);
                                objectStoreRequest.onsuccess = function(event) {
                                    let observationImage = event.target.result;
                                     This.deleteImage(observationImage)
                                }
                            }
                        },
                        /* Delete Image */
                        deleteImage(observationImage)
                        {
                            this.deleteImageFromLocalStore(observationImage);
                            //var divImg = document.getElementById("divImg");
                            var divImg=$("div[imgFile='"+observationImage.illustration.fileName+"']");
                            divImg.remove();
                        },

                        deleteImageFromLocalStore(observationImage)
                        {
                                let This = this;
                                let isDeletePermissible = false;
                                let isMarkDeleted = false;
                                let observationId = observationImage.observationId;
                                let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));

                               if(observationId)
                                {
                                    $.each(lstObservations, function(index, jobservation)
                                    {
                                        if(jobservation.observationId === observationId)
                                        {
                                             let illustrations = jobservation.observationIllustrationSet;
                                             
                                             $.each(illustrations, function(counter, illustration){
                                                if(illustration.observationIllustrationPK.fileName === observationImage.illustration.fileName)
                                                {
                                                    if(illustration.uploaded)
                                                    {
                                                        illustration.uploaded   = false;
                                                        isMarkDeleted           = true;
                                                    }
                                                    else{
                                                        if(!illustration.uploaded)
                                                        {
                                                            if (typeof(illustration.uploaded) === 'undefined')
                                                            {
                                                                /** Selected existing record marked deleted in localstorage */
                                                                illustration.uploaded = false;
                                                                illustration.deleted = true;
                                                                
                                                                isMarkDeleted         = true; 
                                                            }
                                                            else
                                                            {
                                                                /** Removing element */
                                                                illustrations.splice(counter,1);
                                                            }
                                                        }
                                                        else
                                                        {
                                                             illustration.uploaded = false;
                                                             illustration.deleted = true;
                                                             isMarkDeleted         = true;
                                                        }
                                                    }
                                                    isDeletePermissible = true;
                                                    return false;
                                                }
                                             });
                                        }
                                    });
                                    if(isDeletePermissible)
                                    {
                                        
                                        
                                        localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(lstObservations));
                                        This.deleteImageFromIndexedDB(observationImage, isMarkDeleted );
                                        
                                    }

                                }

                        },
                        deleteImageFromIndexedDB(observationImage, isMarkDeleted)
                        {
                            let This = this;
                            let dbRequest =  indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);

                            dbRequest.onsuccess = function(evt) {
                                let db = evt.target.result;
                                let transaction    =   db.transaction([This.entityName],'readwrite'); 
                                let objectstore    =   transaction.objectStore(This.entityName);

                                //TODO - Remove the blocking below if marking the image for justification require
                                /*
                                if(isMarkDeleted)
                                {
                                    observationImage.illustration.deleted=true;
                                    observationImage.illustration.imageTextData='';
                                     let objectStoreRequest = objectstore.put(observationImage,observationImage.illustration.fileName);
                                }
                                else
                                */
                                {
                                    let objectStoreRequest = objectstore.delete(observationImage.illustration.fileName);
                                }

                            }

                        }

    },
    mounted(){
                    this.CONST_URL_DOMAIN                       = CommonUtil.CONST_URL_DOMAIN;
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
<style scoped>
.close{
  position: absolute;
  right: 0;
  }
  .imagePosition
  {
      position: relative;
  }
</style>

