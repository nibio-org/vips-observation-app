<template>
    <div>
        Photo : Observation Id : {{observationId}}
                Organism Id : {{organismId}}
                Image File Name : {{imageFileName}}

    <common-util ref="CommonUtil"/>
    </div>
</template>

<script>
import CommonUtil from '@/components/CommonUtil'

export default {
    name        :   'PhotoObservation',
    components  :   {CommonUtil},
    props       :   ['observationId','organismId','imageFileName'],
    data()          {
                        return {
                            CONST_URL_DOMAIN    : '--',
                            observationImages   :   {
                                                        observationId               :   '',
                                                        organismId                  :   '',
                                                        illustration                :   {
                                                                                            fileName        : '',
                                                                                            imageTextData   : '', 
                                                                                            deleted         : false
                                                                                        } ,
                                                        observationIllustrationSet  :   []
                                                    },
                            storageData         :   [] 


                        }
                    },
    methods     :   {
                        checkPhotoAvailability()
                            {
                             this.storageData = localStorage.getItem(CommonUtil.CONST_STORAGE_IMAGE_LIST);
                            if(lstPhotosJson)
                            {
                                // TODO
                                // Get Photos from store 
                                // check mentioned specfic photos available in store or not if not fetch from server
                                // If two way sync .. check whether fetch needed or not to pull more 


                            }
                            else
                            {
                                //TODO
                                // Fetch photos from server
                                
                                 fetchFromServer();

                            }
                        },
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
                                    This.getImageDataJSON(This.imageFileName,imageTextData);
                                    //console.log('RESULT:', imageTextData)
                                    This.storeData(This);
                                })
                        },

                        getImageDataJSON(fileName,imageTextData)
                        {
                                this.observationImages.observationId                    =   this.observationId;
                                this.observationImages.organismId                       =   this.organismId;
                                this.observationImages.illustration.fileName            =   fileName;
                                this.observationImages.illustration.imageTextData       =   imageTextData;
                        },

                        storeData()
                        {
                            this.storageData    =   JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_IMAGE_LIST));
                            let storageData     = this.storageData;
                            let imageData       =   this.observationImages;
                            let imageFileName   =   this.imageFileName;
                            let This            =   this;
                             if(this.storageData && this.storageData.length != 0)
                             {
                                let flagFound01 = false;
                                $.each(storageData, function(index, data){
                                        if(
                                            (data.observationId === imageData.observationId) && 
                                            (data.organismId    === imageData.organismId) 
                                        )
                                        { 
                                            flagFound01 = true;
                                            let illustrations = data.observationIllustrationSet;
                                            let flagFound02 = false;
                                            $.each(illustrations, function(x, image){ 
                                                if(image.fileName === imageFileName)
                                                {
                                                    /**
                                                     *  Either no write / save to local disk
                                                        Or overwrite local storage data
                                                     */

                                                    flagFound02 = true;
                                                    return false;
                                                }
                                                else
                                                {
                                                    /** 
                                                     * Decide write operation for new illustration of existing observation
                                                     * -- If flagFound02 is 'false' then it trigger the write opeation after the immediate loop
                                                     */
                                                   
                                                }
                                            })
                                                if(!flagFound02)
                                                {
                                                    data.observationIllustrationSet.push(imageData.illustration);
                                                    localStorage.setItem(CommonUtil.CONST_STORAGE_IMAGE_LIST,JSON.stringify(storageData));

                                                }

                                        }
                                        else{
                                                /**Decide write for new observation in non emtpty store 
                                                -- If flagFound01 flag false then it will triger the write operation after loop.
                                                */
                                            }
                                })

                                if(!flagFound01)
                                {
                                        let localObservationImageData = {
                                                                            observationId              :    This.observationImages.observationId,
                                                                            organismId                 :    This.observationImages.organismId,
                                                                            observationIllustrationSet :    [
                                                                                                                This.observationImages.illustration
                                                                                                            ]
                                                                        };

                                        storageData.push(localObservationImageData);
                                        localStorage.setItem(CommonUtil.CONST_STORAGE_IMAGE_LIST,JSON.stringify(storageData));
                                }
                             }
                             else{
                                 console.log('storage system call 2');
                                 
                                 let localObservationImages = [];
                                 let localObservationImageData = {
                                                                     observationId              :    this.observationImages.observationId,
                                                                     organismId                 :    this.observationImages.organismId,
                                                                     observationIllustrationSet :    [
                                                                                                        this.observationImages.illustration
                                                                                                     ]
                                                                };

                                localObservationImages.push(localObservationImageData);
                                localStorage.setItem(CommonUtil.CONST_STORAGE_IMAGE_LIST,JSON.stringify(localObservationImages));
                                this.storageData = JSON.parse(localStorage.getItem(CommonUtil.CONST_STORAGE_IMAGE_LIST));
                                return false;
                                
                             }

                        }

    },
    mounted()       {

            this.CONST_URL_DOMAIN = this.$refs.CommonUtil.getDomain();
            
            this.fetchFromServer();
            
    }

}
</script>
