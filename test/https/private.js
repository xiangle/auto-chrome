"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true,
      devtools: true,
   })

   try {

      const page = await chrome.newPage('https://www.szhkch.com/')

      await page.run(async function () {

         let elements = document.querySelectorAll("body a")

         let key = Math.round(Math.random() * (elements.length * 0.3))

         let element = elements[key]

         if (element) {

            let tagetElement = element

            // 迭代到根节点，将所有父级style.display设为block
            while (element) {
               element = element.parentNode
               if (element && element.style) {
                  element.style.display = "block"
               }
            }

            let { x, y, width, height } = await tagetElement.getBoundingClientRect()

            let { innerText, href } = tagetElement

            return { x, y, width, height, innerText, href };

         }

      })

      await sleep(2000)

      await chrome.page.clicker.scroll(0, 500)

      await sleep(1000)

      await page.close()

      await sleep(2000)

   } catch (error) {

   }

   await chrome.close()

}

main().catch(function (error) {
   console.error(error)
})