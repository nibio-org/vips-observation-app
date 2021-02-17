<template>
  <div>
    <form v-if="sharedState.uuid == ''" class="my-2 my-lg-0">
      <div class="form-group">
        <input
          class="form-control mr-sm-2"
          type="text"
          placeholder="Brukernavn"
          aria-label="Brukernavn"
          v-model="username"
        />
      </div>
      <div class="form-group">
        <input
          class="form-control mr-sm-2"
          type="password"
          placeholder="Passord"
          aria-label="Passord"
          v-model="password"
        />
      </div>
      <button class="btn btn-primary" type="button" v-on:click="handleLogin()">
        Logg inn
      </button>
    </form>

    <div v-else>
      <span
        >{{ sharedState.user.firstName }} {{ sharedState.user.lastName }}</span
      ><br />
      <button class="btn btn-primary" type="button" v-on:click="handleLogout()">
        Logg out
      </button>
    </div>
  </div>
</template>

<script>
import CommonUtil from "@/components/CommonUtil";

export default {
  name: "LoginSystem",
  props:{
      isWelcome : Boolean
  },
  data() {
    return {
      jsonServerResponse : '',
      sharedState: {
        user: {},
        uuid: "",
      },
      username: "",
      password: "",
    };
  },
  //emits: {},
  methods: {
    /** Get  user details from local storage */
    getUserFromStorage() {
      
      let strUser = localStorage.getItem(CommonUtil.CONST_STORAGE_USER_DETAIL);
      let user = JSON.parse(strUser);


      this.sharedState.uuid = user.userUuid;
      this.sharedState.user.firstName = user.firstName;
      this.sharedState.user.lastName = user.lastName;

      this.$root.sharedState.uuid = user.userUuid;

       /** Firing event to main  */
      //this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,user.userUuid, user.firstName,user.lastName);
    },

    /** Check uuid first */
    checkValidUUID() {
      let userUUID = localStorage.getItem(CommonUtil.CONST_STORAGE_UUID);

      console.log("check uuid : " + CommonUtil.CONST_STORAGE_UUID);

      console.log("loginForm : " + userUUID);

      /** Fetch to get details */

      let jsonHeader = { Authorization: userUUID };

      fetch(CommonUtil.CONST_URL_DOMAIN + CommonUtil.CONST_URL_AUTH_UUID, {
        method: "GET",
        headers: jsonHeader,
      }).then((response) => {
        if (response.status != 200) {
            this.$root.sharedState.uuid = '';
          console.log("LoginSystem : response status :" + response.status);
        } else {
          this.getUserFromStorage();
        }
      });


    },

  handleLogin(){
      this.sharedState.uuid = '';
    let jsonBody = JSON.stringify({"username": this.username, "password":this.password});
    /** Fetch to get UUID */
    fetch(
      CommonUtil.CONST_URL_DOMAIN +"/rest/auth/login",
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
            CommonUtil.CONST_URL_DOMAIN +CommonUtil.CONST_URL_AUTH_UUID,
            {
              method:"GET",
              headers: jsonHeader,
            } 
          )
            .then((response) => response.json())
            .then((data) => {
              let loggedUser = data;
              //this.sharedState.user = {"firstName":loggedUser.firstName, "lastName":loggedUser.lastName};
              localStorage.setItem(CommonUtil.CONST_STORAGE_USER_DETAIL,JSON.stringify(loggedUser));
               this.getUserFromStorage();
            });

        }
      });

      
  },
    handleLogout()
    {
        console.log('Login System - handleLogout - 1 ');
        this.sharedState.uuid='';                                   // remove local uuid  for login screen
        this.$root.sharedState.uuid = '';                           // remove global uuid for other (e.g. menu items etc)
        localStorage.removeItem(CommonUtil.CONST_STORAGE_UUID);     // remove uuid from storage
        this.$emit(CommonUtil.CONST_EVENT_LOGIN_USER_DETAIL,'');
        console.log('Login System - handleLogout - 2 ');
    }

  },
  created() {
    console.log("login system - created");
    this.checkValidUUID();
    //this.$root.$refs.LoginSystem = this;
  },
};
</script>

<style scoped>
</style>