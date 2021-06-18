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
    };
  },
  //emits: {},
  methods: {
    /** Get  user details from local storage */
      getUserFromStorage() {
      
      let strUser = localStorage.getItem(CommonUtil.CONST_STORAGE_USER_DETAIL);
      let user    = JSON.parse(strUser);
      this.appUser  = user; //This user will require in Sync process

      this.$root.sharedState.uuid = user.userUuid;
      this.$root.sharedState.user.firstName = user.firstName;
      this.$root.sharedState.user.lastName = user.lastName;
      this.userLoggedInName = this.$root.sharedState.user.firstName + " " + this.$root.sharedState.user.lastName;
       /** Firing event to parent (main.js)  */
      //this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,user.userUuid, user.firstName,user.lastName);
    },

    /** Check uuid first */
    checkValidUUID() {
      let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);
      /** Fetch to get details */
      let jsonHeader = { Authorization: userUUID };

      fetch(this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_UUID, {
        method: "GET",
        headers: jsonHeader,
      }).then((response) => {
        
        if (response.status != 200) {
            this.$root.sharedState.uuid = '';
        } else {
          
          this.getUserFromStorage();
          /** Sync Operation for valid timestamp */
          this.$refs.Sync.syncOneWayDifferentTimeStamp(this.appUser);
        }
      });

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
      .then((response) => response.json())
      .then((data) => {
        let jsonServerResponse = '';
        this.jsonServerResponse = data;
        if(this.jsonServerResponse.success == true)
        {
          this.username='';
          this.password='';
          
          localStorage.setItem(CommonUtil.CONST_STORAGE_UUID,this.jsonServerResponse.UUID);

          /** Fetch to get details */

           let jsonHeader = {Authorization:this.jsonServerResponse.UUID};
           
           fetch(
            this.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_UUID,
            {
              method:"GET",
              headers : jsonHeader
            } 
          )
            .then(function(response) {
              if(response.status === 200)
              {
                return response.json()
              }
              else
              {
                console.log('error : '+response.text());
                  This.errMsg = response.text();
                  
                  
              }
            })

              /* (response) => response.json()
              ) */
            .then((data) => {
              let loggedUser = data;
              localStorage.setItem(CommonUtil.CONST_STORAGE_USER_DETAIL,JSON.stringify(loggedUser));

              
              this.getUserFromStorage();
              $('.offcanvas-collapse').removeClass('open');
              /** Calling of Sync */
              //this.isSyncNeeded = true;
              this.$refs.Sync.isSyncOnewayNeeded(loggedUser);
              this.$refs.Sync.syncTwoWayAtLogin();
                            
              //this.$router.replace({path:'/'});
            });

        }
      });
  },
    handleLogout()
    {
        this.$root.sharedState.uuid = '';                           // remove global uuid for other (e.g. menu items etc)
        localStorage.removeItem(CommonUtil.CONST_STORAGE_UUID);     // remove uuid from storage
        this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,'');
		$('.offcanvas-collapse').removeClass('open');
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