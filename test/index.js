const autoChrome = require('..')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      headless: false,
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true, //忽略https错误
      devtools: true,
      slowMo: 20, // 减速
   })

   await chrome.getVersion()

   await sleep(1000)

   let page1 = await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   let page2 = await chrome.newPage('https://www.baidu.com/')

   await sleep(2000)

   await page2.goto('http://www.runoob.com/')

   await sleep(2000)

   await page2.mouse.scroll(0, 500)

   await sleep(1000)

   await page1.close()

   await sleep(2000)

   await page2.close()

   await sleep(3000)

   await chrome.close()

}

run()

