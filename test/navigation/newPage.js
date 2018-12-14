const autoChrome = require('../../')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('http://www.runoob.com/')

   console.log('-----------------')

   let element = await chrome.page.$('.runoob-block dl dd:nth-child(2) a')

   await element.scroll()

   await element.click()

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(3) a')

   await element.scroll()

   await element.click()

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(4) a')

   await element.scroll()

   await element.click()

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(5) a')

   await element.scroll()

   await element.click()

}

main()