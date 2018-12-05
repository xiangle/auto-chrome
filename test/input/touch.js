const autoChrome = require('../..')
const config = require('../helpers/config')

const { sleep, logger } = autoChrome.helper

const { executablePath, userDataDir } = config

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: true,
      // slowMo: 20, // 减速
   })

   let page = chrome.page

   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/input/touch.html')

   await sleep(1000)

   let input = await page.$('input')

   await input.click()

   await input.type('hellow你好吗')

}

main().catch(function (error) {
   console.log(error)
})