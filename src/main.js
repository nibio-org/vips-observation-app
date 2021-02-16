// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import i18n from './i18n'
import CmmonUtil from '@/components/CommonUtil'
import LoginSystem from '@/components/LoginSystem'


Vue.config.productionTip = false

var store = {
    debug: true,
    state: {
      user:{},
      uuid:""
    }
}


/* eslint-disable no-new */
const init = () => {
	new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>',

      data: {
          sharedState : store.state
	    },

      methods: {
	  },

      i18n,

      created() {
		console.info("Vue is ready");
		console.info("User's preferred language is " + navigator.language);
	  }
    });
};

/**
 * Hope this works. It's for adding router functionality to the menu,
 * which is outside the main app
 */
new Vue({
  el: '#vipsobsappmenu',
  router,
  i18n,
  data: {
    //jsonServerResponse,
    sharedState: store.state,
    username: "",
    password:""
  },

  components :
  {
    LoginSystem
  },
  methods: {

    enableLogin(uuid,fname,lname) {
      this.sharedState.uuid  = uuid;
      this.sharedState.user.firstName=fname;
      this.sharedState.user.lastName=lname;
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

          this.sharedState.uuid = this.jsonServerResponse.UUID;
          localStorage.setItem(CommonUtil.CONST_STORAGE_UUID,this.jsonServerResponse.UUID);

           /** Fetch to get details */

           let jsonHeader = {Authorization:this.jsonServerResponse.UUID};
           
           fetch(
            CommonUtil.CONST_URL_DOMAIN +"/rest/auth/uuid",
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
               //getUserFromStorage();
            });

        }
      });

      
  },

    handleLogout()
    {
        this.sharedState.uuid='';
    }
  },
  mounted(){
    //LoginSystem.checkValidUUID();
    //this.$root.$refs.LoginSystem.checkValidUUID();
  }
});

// Wait for the deviceready event to start the render
document.addEventListener("deviceready", () => {
  // eslint-disable-next-line
  console.log("Cordova ready, Render the App");
  init();
});

// If we are not in Cordova, manually trigger the deviceready event
const isCordovaApp = (typeof window.cordova !== "undefined");
if (!isCordovaApp){
  document.dispatchEvent(new CustomEvent("deviceready", {}));
}

