// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import i18n from './i18n'

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
  methods: {
    handleLogin(){
      let jsonBody = JSON.stringify({"username": this.username, "password":this.password});
      /** Fetch to get UUID */
      fetch(
        "http://vipslogic-local.no/rest/auth/login",
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
          
          this.jsonServerResponse = data;
          if(this.jsonServerResponse.success == true)
          {
            this.username='';
            this.password='';

            this.sharedState.uuid = this.jsonServerResponse.UUID;

             /** Fetch to get details */

             let jsonHeader = {Authorization:this.jsonServerResponse.UUID};
             
             fetch(
              "http://vipslogic-local.no/rest/auth/uuid",
              {
                method:"GET",
                headers: jsonHeader,
              } 
            )
              .then((response) => response.json())
              .then((data) => {
                let loggedUser = data;
                this.sharedState.user = {"firstName":loggedUser.firstName, "lastName":loggedUser.lastName};
              });

          }
        });

        
    },
    handleLogout()
    {
        this.sharedState.uuid='';
    }
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

