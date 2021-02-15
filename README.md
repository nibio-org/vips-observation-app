# VIPS Field Observation App

> The Field Pest Observation App for VIPS users

## Prerequisites: node, npm, vue-cli and cordova
Make sure you have the correct versions of npm and nodejs
Use nvm to install, here's [how to install nvm in the first place](https://github.com/nvm-sh/nvm#installing-and-updating)

Then run:

``` bash
nvm install --lts
sudo npm install -g @vue/cli --unsafe-perm
sudo npm install -g cordova --unsafe-perm
``` 

## Build Setup (vuejs)

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080 - only for testing view layer
npm run dev

# build for production with minification - before building with Cordova
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Build/emulate with cordova

``` bash
# Add browser and android platforms (haven't tested iOS yet)
cordova platform add browser
cordova platform add android

# Test in browser
cordova emulate browser

# Test on Android. Requires correct setup of the Android SDK. 
# Read more here: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html
cordova emulate android
```

## Develop the code
### Don't touch the /www folder!
Normally in Cordova you would put your code here, but this is where vue-cli is putting the things that it builds. 

### Main template
The main layout is based on a very simple template snatched from Bootstrap. You find it in /html (at the project root level).
Everything that Vuejs operates on happens inside the `main` element

``` html
<main id="app" role="main" class="container"></main>
```

You find all the Vuejs code in the `/src` folder

Looking at /src/main.js, the Vue app is not started until Cordova fires the deviceready event.

The router components (the "pages" in the Single Page Application that you manage) are found in `/src/components`. The router (paths + components definitions) is found in `/src/router/index.js`

### Checking out new code
Remember to always run `npm install` after checking out new code from the repository. That way, new dependencies will be installed.

### Translation
[This tutorial](https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-vue-app-with-vue-i18n) has been used to enable translation.

I couldn't get the per-component translation thing working (where you embed it in `<i18n>` tags),
so all translations go into the `/locales/[languagecode].json` files.


There's a simple translation example in /components/ObservationList.js:

``` html
<template>
  <div class="hello">
    <h1>{{ $t('startpage') }}</h1>
    <router-link to="/observation" custom v-slot="{navigate}">
      <button type="button" class="btn btn-primary" @click="navigate">+</button>
    </router-link>
    
    </div>
</template>
```

(TODO: Update this documentation when code in ObservationList changes)

Change the startup language in the app here in `/i18n.js`:

``` javascript
export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'nb', // Here you can customize
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
```

## Misc
* [First draft of application state management](./docs/Application_state.pdf)

