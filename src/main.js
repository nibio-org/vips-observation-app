// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import i18n from './i18n'

Vue.config.productionTip = false

/* eslint-disable no-new */
const init = () => {
	new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>',

      data: {
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

