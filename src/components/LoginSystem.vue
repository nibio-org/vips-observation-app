<template>
  <div>
    <form v-if="$root.sharedState.uuid == ''" class="my-2 my-lg-0">
      <div class="form-group">
        <input
          class="form-control mr-sm-2"
          type="text"
          placeholder="Brukernavn"
          aria-label="Brukernavn"
          v-model="username"
          v-on:keyup.enter="handleLogin()"
        />
      </div>
      <div class="form-group">
        <input
          class="form-control mr-sm-2"
          type="password"
          placeholder="Passord"
          aria-label="Passord"
          v-model="password"
          v-on:keyup.enter="handleLogin()"
        />
      </div>

      <button class="btn btn-primary" type="button" v-on:click="handleLogin()" v-on:keyup.enter="handleLogin()"> 
        Logg inn
      </button>
      <div v-show="errMsg" class="alert alert-warning alert-dismissible fade show">
        {{errMsg}}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>        
      </div>
      <div v-show="isLogginFail" class="text-danger">
          {{ $t("prop.login.systems.wrong.credential") }}
      </div>
     </form>

    <div v-else>

      <span v-text="userLoggedInName"></span>
        
        <br />
      <button class="btn btn-primary" type="button" v-on:click="handleLogout()">
        Logg out
      </button>
    </div>

    <!-- <Sync :isSyncNeeded="isSyncNeeded"/>  -->
    <Sync ref="Sync"/> 
    <common-util ref="CommonUtil"/>
  </div>
  
</template>

<script>
import CommonUtil from "@/components/CommonUtil";
import Sync from '@/components/Sync';


export default {
  name: "LoginSystem",
  components : {Sync,CommonUtil},
  props:{
      isWelcome : Boolean,
      
  },
  data() {
    return {
      CONST_URL_DOMAIN   : '',
      jsonServerResponse : '',
      userLoggedInName: this.$root.sharedState.user.firstName + " " + this.$root.sharedState.user.lastName,
      username: "",
      password: "",
      appUser:{},
      isSyncNeeded:false,
      errMsg      : '',
      isLogginFail : false,
    };
  },
  //emits: {},
  methods: {
    /** Get  user details from local storage */
      getUserFromStorage() {
      
      let strUser = localStorage.getItem(CommonUtil.CONST_STORAGE_USER_DETAIL);
      if(strUser && strUser != 'undefined')
      {
       
      let user    = JSON.parse(strUser);
      this.appUser  = user; //This user will require in Sync process

      this.$root.sharedState.uuid = user.userUuid;
      this.$root.sharedState.user.firstName = user.firstName;
      this.$root.sharedState.user.lastName = user.lastName;
      this.userLoggedInName = this.$root.sharedState.user.firstName + " " + this.$root.sharedState.user.lastName;
      }
       /** Firing event to parent (main.js)  */
      //this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,user.userUuid, user.firstName,user.lastName);
    },

    /** Check uuid first */
    checkValidUUID() {
      if(localStorage.getItem(CommonUtil.CONST_STORAGE_UUID))
      {
        let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
        /** Fetch to get details */
        let jsonHeader = { Authorization: userUUID };

        fetch(this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_UUID, {
          method: "GET",
          headers: jsonHeader,
        }).then((response) => {
          
          if (response.status != 200 || response.status != 201) {
              this.$root.sharedState.uuid = '';
          } else {
            
            this.getUserFromStorage();
            /** Sync Operation for valid timestamp */
            this.$refs.Sync.syncOneWayDifferentTimeStamp(this.appUser);
          }
        });
      }
    },

  handleLogin(){
      let This = this;
      this.$root.sharedState.uuid = '';
    let jsonBody = JSON.stringify({"username": this.username, "password":this.password});
    /** Fetch to get UUID */
    fetch(
      this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_LOGIN,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body : jsonBody
      } 
    )
      .then(function(response){
          if(response.status === 200 || response.status === 201)
          {
            This.isLogginFail = false;
            return response.json();
          }
          else
          {
              This.isLogginFail = true;
              return false;
          }
        })

      .then((data) => {
        let jsonServerResponse = '';
        this.jsonServerResponse = data;
        
        if(this.jsonServerResponse.success)
        {
          this.username='';
          this.password='';
          

          localStorage.setItem(CommonUtil.CONST_STORAGE_UUID,data.UUID);
          
        } 

          /** Fetch to get details */

          let uuid = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);

           let jsonHeader = {Authorization:uuid};
           fetch(
            this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_UUID,
            {
              crossDomain:true,
              method:"GET",
              //headers : jsonHeader
              headers: {
                        "Content-Type": "application/json",
                        'Authorization' : uuid
              }

            } 
          )
            .then(response => response.json())        
          /*
            .then(function(response) {
              console.log('response status : '+response.status);
              console.log(response.json());
              if(response.status === 200 || response.status === 201)
              {
                
                return response.json()
              }
              else
              {
                console.log('error : '+response.text());
                  This.errMsg = 'error with status : '+response.status + ' -- error type : '+response.type+ ' -- error source : '+response.url;
              }
            })
          */
            .then((data) => {
              
              let loggedUser = data;
              if(loggedUser || loggedUser != 'undefined')
              {
                console.log(data);
                  localStorage.setItem(CommonUtil.CONST_STORAGE_USER_DETAIL,JSON.stringify(loggedUser));
                  
                  
                  this.getUserFromStorage();
                  $('.offcanvas-collapse').removeClass('open');
                  /** Calling of Sync */
                  //this.isSyncNeeded = true;

                  this.$refs.Sync.isSyncOnewayNeeded(loggedUser);
                  this.$refs.Sync.syncTwoWayAtLogin();
                  localStorage.setItem(CommonUtil.CONST_STORAGE_UUID,uuid);             
                  this.$router.replace({path:'/welcome'});
              }
            });
              
        
      });
  },
  handleLogout()
  {
      this.$root.sharedState.uuid = '';                           // remove global uuid for other (e.g. menu items etc)
      /** Remove stored data from app in local system - server data still preserve */
      this.removeStoredData();

      this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,'');
      $('.offcanvas-collapse').removeClass('open');
       this.$router.replace({path:'/logout'});
  },
  /** Remove stored data on logout */
  removeStoredData()
  {
    console.log('remove method called');
    /* Remove localstorage */
    localStorage.removeItem(CommonUtil.CONST_STORAGE_OBSERVATION_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_UUID);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_USER_DETAIL);
    localStorage.removeItem(CommonUtil.CONST_STORE_TIMESTAMP);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_CROP_CATEGORY);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_CROP_ID_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_CROP_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_PEST_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_CROP_PEST_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_IMAGE_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_POI_LIST);
    localStorage.removeItem(CommonUtil.CONST_STORAGE_VISIBILITY_POLYGON);

    /* Remove from IndexedDB */
        let dbRequest =  null;
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

  },
  mounted() {
    this.CONST_URL_DOMAIN = CommonUtil.CONST_URL_DOMAIN;
    this.checkValidUUID();
  },
};
</script>

<style scoped>
</style>