#!/usr/bin/env node

// From : https://stackoverflow.com/questions/31999368/check-cordova-version-from-javascript/65471679#65471679
// Good to read https://stackoverflow.com/questions/28304156/how-do-i-get-the-version-string-i-defined-in-the-config-xml
// Good to read https://www.bram.us/2015/01/04/cordova-build-hook-script-for-displaying-build-version-in-your-app/
// see https://stackoverflow.com/a/42650842
// This plugin replaces text in a file with the app version from config.xml.

// be sure to exec `npm i xml2js --save-dev` to make xml2js available
console.log('Enter into Hooks');
var wwwFileToReplace = "index.html";

var fs = require('fs')
var path = require('path')

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot
  const wwwDir = path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'www')

  var configXMLPath = 'config.xml'
  loadConfigXMLDoc(configXMLPath, (rawJSON) => {
    var version = rawJSON.widget.$.version
    console.log('Version:', version)

    var fullfilename = path.join(wwwDir, wwwFileToReplace)
    if (fs.existsSync(fullfilename)) {
      replaceStringInFile(fullfilename, '%%VERSION%%', version)
      console.log(context.hook + ': Replaced version in file: ' + path.relative(projectRoot, fullfilename))
    } else {
      console.error('File does not exist: ', path.relative(projectRoot, fullfilename))
      process.exit(1)
    }
  })
}

function loadConfigXMLDoc (filePath, callback) {
  var fs = require('fs')
  var xml2js = require('xml2js')
  try {
    var fileData = fs.readFileSync(filePath, 'ascii')
    var parser = new xml2js.Parser()
    parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
      if (err) {
        console.error(err)
        process.exit(1)
      } else {
        // console.log("config.xml as JSON", JSON.stringify(result, null, 2))
        console.log("File '" + filePath + "' was successfully read.")
        callback(result)
      }
    })
  } catch (ex) {
    console.log(ex)
    process.exit(1)
  }
}

function replaceStringInFile (filename, toReplace, replaceWith) {
  var data = fs.readFileSync(filename, 'utf8')

  var result = data.replace(new RegExp(toReplace, 'g'), replaceWith)
  fs.writeFileSync(filename, result, 'utf8')
}