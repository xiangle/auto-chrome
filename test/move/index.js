"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: true,
   })

   const { page } = chrome;

   page.goto('D:/Nodejs/Project/auto-chrome/test/move/index.html')

   await sleep(1500)

   await page.clicker.move(300, 100)

   await page.clicker.move(600, 600)

   await page.clicker.click(300, 500)

   await page.clicker.click(600, 100)

   await page.clicker.click(1000, 350)

}

main()