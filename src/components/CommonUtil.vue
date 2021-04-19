<template></template>
<script>
//const CONST_STR_TEST ="test 123"
export default {
    CONST_STR_TEST                      :   'abcd',

    CONST_EVENT_LOGIN_USER_DETAIL       :   'eventloginuserdetail',

    CONST_STORAGE_UUID                  :   'user-uuid',
    CONST_STORAGE_USER_DETAIL           :   'store-user-detail',
    CONST_STORE_TIMESTAMP               :   'store-time-stamp',
    CONST_STORAGE_CROP_CATEGORY         :   'store-crop-category',
    CONST_STORAGE_CROP_ID_LIST          :   'store-crop-id-list',
    CONST_STORAGE_CROP_LIST             :   'store-crop-list',
    CONST_STORAGE_PEST_LIST             :   'store-pest-list',
    CONST_STORAGE_CROP_PEST_LIST        :   'store-crop-pest-list',
    CONST_STORAGE_OBSERVATION_LIST      :   'store-observation-list',
    CONST_STORAGE_IMAGE_LIST            :   'store-image-list',
    CONST_STORAGE_POI_LIST              :   'store-poi-list',

    CONST_POI_TYPES                     :   '[{"point_of_interest_type_id":0,"default_name":"General"},{"point_of_interest_type_id":4,"default_name":"Region"},{"point_of_interest_type_id":1,"default_name":"Weather Station"},{"point_of_interest_type_id":2,"default_name":"Farm"},{"point_of_interest_type_id":3,"default_name":"Field"}]',

    CONST_IMAGE_WIDTH                   :   100,
    CONST_IMAGE_HEIGHT                  :   100,
    CONST_IMAGE_CANVAS_WIDTH            :   100,
    CONST_IMAGE_CANVAS_HEIGHT           :   100,

    CONST_CROP_CATEGORY_ID              :   'cropCategoryId',
    CONST_ORGANISM_ID                   :   'organismId',

    CONST_OBSERVATION_COUNT_START_ID    :    -1,
    CONST_POI_COUNT_START_ID            :    -1,
    
    CONST_URL_AUTH_UUID                 :   '/rest/auth/uuid',
    CONST_URL_AUTH_LOGIN                :   '/rest/auth/login',
    CONST_URL_LAST_TIMESTAMP            :   '/rest/observation/organismsystemupdated',

    CONST_URL_CROP_CATEGORY             :   '/rest/organism/cropcategory/',
    CONST_URL_CROP_LIST                 :   '/rest/organism/crop/list',
    CONST_URL_PEST_LIST                 :   '/rest/organism/pest/list',
    CONST_URL_CROP_PEST_LIST            :   '/rest/organism/crop/pest/list',
    
    CONST_URL_USER_OBSERVATION_LIST     :   '/rest/observation/list/user',
    CONST_URL_USER_POI                  :   '/rest/poi/user',

    CONST_URL_STATIC_IMAGE_PATH         :   '/static/images/observations/',
    
    CONST_GPS_URL_NORWAY_MAP            :   'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?Version=1.0.0&service=wmts&request=getcapabilities',
    CONST_GPS_DEFAULT_LATITUDE_NORWAY   :   16,
    CONST_GPS_DEFAULT_LONGITUDE_NORWAY  :   63,

    CONST_GPS_DEFAULT_ZOOM              :   4.2,
    CONST_GPS_OBSERVATION_ZOOM          :   10,

    CONST_DB_NAME                       :   'db-index-observation',
    CONST_DB_VERSION                    :   1,
    CONST_DB_ENTITY_PHOTO               :   'entityPhoto',

    data(){
        return {
            isEmulator                          :   false,
            CONST_URL_DOMAIN                    :   'http://vipslogic-local.no',  //'http://logic.testvips.nibio.no/', //'http://vipslogic-local.no',
            CONST_URL_DOMAIN_EMULATOR_ANDROID   :   'http://10.0.2.2:8080/VIPSLogic', /** Android emulator host loop back */

            domain                              :   'test',
            domains                             :   [
                                                        'http://vipslogic-local.no',
                                                        'http://10.0.2.2:8080/VIPSLogic'
                                                    ],

        }
    },
    methods :
    {
            getDomain()
            {   let resultURL = (this.isEmulator) ? this.CONST_URL_DOMAIN_EMULATOR_ANDROID : this.CONST_URL_DOMAIN;
                return resultURL;
            },
            //TODO - Below code need to be developed basis of HOST domain search for platform independency
             domainCheck()
            {
                let domain = this.domain;
                let domains = this.domains;
                let site = 'http://vipslogic-local.no';
                    const requestAnimeAwait = async (site) => {
                    const response = await fetch('http://vipslogic-local.no', {mode:'no-cors'});
                    const json = await response.text();
                    console.log("async/await based");
                    console.log(response);
                        }

                requestAnimeAwait();
            }
    },
    
   


}
</script>