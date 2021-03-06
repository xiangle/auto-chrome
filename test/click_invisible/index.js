"use strict";

const autoChrome = require('../../lib/');
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/');

/**
 * @param {*} device 用户配置目录名称
 */
async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      devtools: true
   })

   const { page } = chrome;

   // await page.setViewport({
   //    width: 0,
   //    height: 0,
   // })

   await sleep(1000);

   await page.goto('D:/Nodejs/Project/auto-chrome/test/click/index.html');

   // 触发isTrusted:false click
   // await page.$eval('#button', element => {
   //    element.clickNav()
   // });

   // 显示隐藏的按钮
   await page.$eval('#button', element => {
      element = element.parentNode
      if (element && element.style) {
         element.style.display = "block"
      }
   });

   // 触发isTrusted:true click
   await page.click('#button');

}

main();