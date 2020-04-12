"use strict"

const autoChrome = require('../../lib')
const { userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   // let body = await chrome.page.$('body')

   // let header = await body.$('#header')

   // let nav = await header.$$('nav > a')

   let nav = await chrome.page.$$('#header nav > a')

   let [, , element] = nav

   let innerText = await element.get('innerText')

   console.log(innerText)

}

main()