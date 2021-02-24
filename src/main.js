// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import i18n from './i18n'
import CmmonUtil from '@/components/CommonUtil'
import LoginSystem from '@/components/LoginSystem'
import Welcome from '@/components/Welcome'



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
    LoginSystem,
    Welcome
  },
  methods: {
    /** This below method for child (LoginSystem) to Parent (Main.js) communication using events */
   /*
      enableLogin(uuid,fname,lname) {
      this.sharedState.uuid  = uuid;
      this.sharedState.user.firstName=fname;
      this.sharedState.user.lastName=lname;
    }
    */
  },

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

