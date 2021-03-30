<template>
    <div>
     <img src='' class="img-thumbnail float-left" ref="image"/>
    <common-util ref="CommonUtil"/>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'

export default {
    name        :   'Photo',
    components  :   {CommonUtil},
    props       :   ['observationId','organismId','imageFileName'], 
    data ()  {
                return {
                    dbIndexPhoto        :   '',
                    entityName          :   '',
                    observationImage   :   {
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
                    fetchFromServer()
                        {
                            let photoURL=this.CONST_URL_DOMAIN+CommonUtil.CONST_URL_STATIC_IMAGE_PATH+this.organismId+'/'+this.imageFileName;
                            let imgTest;
                            let This = this; 
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
                                        This.storeData();
                                })
                        },
                        async storeData()
                        {       let This    =   this;
                           
                            let dbRequest = indexedDB.open(CommonUtil.CONST_DB_NAME, CommonUtil.CONST_DB_VERSION);
                            dbRequest.onsuccess = function(evt) {
                                let db = evt.target.result;
                                let transaction = db.transaction([This.entityName],'readwrite'); 
                                let objectstore = transaction.objectStore(This.entityName).add(This.observationImage,This.observationImage.illustration.fileName);
                            } 
                            

                            dbRequest.onupgradeneeded= function (event)
                            {
                                let db = event.target.result;
                                if( !db.objectStoreNames.contains(This.entityName)){
                                   let store = db.createObjectStore(This.entityName, {keypath : This.observationImage.illustration.fileName});
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
                                    let objectstoreRequest = objectstore.get(This.observationImage.illustration.fileName);

                                    objectstoreRequest.onsuccess = function(event)
                                    {
                                        let observationImage = event.target.result;
                                        This.displayImage(observationImage.illustration.imageTextData);
                                    }
                             }

                        },
                         displayImage(imgTextData)
                        {
                            let image = this.$refs.image;
                            image.width = CommonUtil.CONST_IMAGE_WIDTH;
                            image.height = CommonUtil.CONST_IMAGE_HEIGHT;
                            image.src=imgTextData;

                        }

    },
    mounted(){
                    this.CONST_URL_DOMAIN                       = this.$refs.CommonUtil.getDomain();
                    this.entityName                             = CommonUtil.CONST_DB_ENTITY_PHOTO;

                    this.observationImage.observationId         =   this.observationId;
                    this.observationImage.organismId            =   this.organismId;
                    this.observationImage.illustration.fileName =   this.imageFileName;      



                    this.fetchFromServer();
                    this.getImageFromStore();
    }    
}
</script>