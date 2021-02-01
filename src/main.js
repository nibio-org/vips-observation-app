// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

/**
 * Hope this works. It's for adding router functionality to the menu,
 * which is outside the main app
 */
new Vue({
  el: '#vipsobsappmenu',
  router
});
