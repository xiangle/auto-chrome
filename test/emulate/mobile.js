"use strict";

const autoChrome = require('../../lib')
const { executablePath, userDataDir } = require('../config.js');
const devices = require('../../device.js');

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         viewport,
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
      },
      // devtools: true,
   })

   await chrome.newPage('http://www.so.com/')

   const data = await chrome.page.run(() => {

      return JSON.stringify({
         "window.screen.height": window.screen.height,
         "window.screen.width": window.screen.width,
         "window.screen.availHeight": window.screen.availHeight,
         "window.screen.availWidth": window.screen.availWidth
      })

   })

   console.log(data)

}

main()