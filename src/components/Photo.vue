<template>
    <div class='divImg' :imgFile='imageFileName'>



        <div v-if=isImageVisible>
            <div id='divPositionImg' class="float-left imagePosition" >
                <button class="close" type="button" @click="showModal">×</button>
                <img src=''  class='img-thumbnail ' ref="image"/>
            </div>
        </div>
        <div v-else>
            <button type="button" class="btn btn-primary" id="cameraLauncher" ref='cameraLauncher' @click="launchCamera">{{ take_photo }}</button>
            <div id='divPhoto'></div>
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
    </div>

</template>

<script>
import CommonUtil from '@/components/CommonUtil'
import Modal from '@/components/Modal'

export default {
    name        :   'Photo',
    components  :   {CommonUtil, Modal},
    props       :   ['observationId','organismId','imageFileName','isImageVisible'], 
    data ()  {
                return {
                    take_photo          : "Ta bilde",
                    isModalVisible           :   false,
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
                                                    if(observationImage)
                                                    {
                                                        This.displayImage(observationImage.illustration.imageTextData);
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



                        },
                         displayImage(imgTextData)
                        {
                            let image = null;
                            if(this.$refs.image)
                            {
                                 image = this.$refs.image;
                            }
                            else{

                                let modalForm = document.createElement('Modal');
                                    modalForm.setAttribute('v-show','isModalVisible');
                                    modalForm.setAttribute('v-on:close','closeModal');
                                    modalForm.setAttribute('v-on:action','actionModal');
                                
                                let divPosition = document.createElement('div');
                                    divPosition.setAttribute('id','divPositionImg');
                                    divPosition.setAttribute('class','float-left imagePosition');
                                    
                                let buttnClose = document.createElement('button');
                                    buttnClose.setAttribute('class','close');
                                    buttnClose.innerHTML='x';
                                    buttnClose.style.color='red';

                                image = document.createElement('img');
                               let imgSrc = document.createAttribute('src');
                               let att = document.createAttribute("class");
                                    att.value = "img-thumbnail float-left"; 
                                    image.setAttributeNode(att);

                                    divPosition.appendChild(buttnClose);
                                    divPosition.appendChild(image);

                               let divPhoto = document.getElementById("divPhoto");
                               let divImg = document.createElement('div');
                               divImg.setAttribute('class','divImg');
                               divImg.appendChild(modalForm);
                               divImg.appendChild(divPosition);
                               divPhoto.appendChild(divImg);

                               //console.log(divImg);

                        }
                            image.width = CommonUtil.CONST_IMAGE_WIDTH;
                            image.height = CommonUtil.CONST_IMAGE_HEIGHT;
                            image.src=imgTextData;

                        },

                        /**  Search IndexedDB for available imaages within a observation */
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
                                    selectedFileFirstName=indexValue+'_illustration'+'_'+(len+1);
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

                            this.addImageIntoObservation(observation);
                            this.storeData(observation);
                            
                        },

                        /** Add image file name into localstorage */
                        addImageIntoObservation(observation)
                        {
                            let lstObservations = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST));
                             if(observation.observationId)
                             {
                                 $.each(lstObservations, function(index, jobservation)
                                 {
                                        if(jobservation.observationId === observation.observationId)
                                        {
                                            let illustration = {};
                                            let observationIllustrationPK = {};
                                                observationIllustrationPK.observationId = observation.observationId;
                                                observationIllustrationPK.fileName = observation.illustration.fileName;

                                                illustration = {'observationIllustrationPK' : observationIllustrationPK, 'uploaded':false};
                                            jobservation.observationIllustrationSet.push(illustration);
                                            
                                        }
                                 });
                             }

                             localStorage.setItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST,JSON.stringify(lstObservations));

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
                                                               illustration.uploaded = false;
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
                                if(isMarkDeleted)
                                {
                                    observationImage.illustration.deleted=true;
                                    observationImage.illustration.imageTextData='';
                                     let objectStoreRequest = objectstore.put(observationImage,observationImage.illustration.fileName);
                                }
                                else
                                {
                                    let objectStoreRequest = objectstore.delete(observationImage.illustration.fileName);
                                }

                            }

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