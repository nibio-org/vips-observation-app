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
### Main template
The main layout is based on a very simple template snatched from Bootstrap.

