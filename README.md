# auto-chrome

## Install

```
npm install auto-chrome
```

使用Node.js自动化控制Chrome或Chromium，基于[chrome devtools](https://chromedevtools.github.io/devtools-protocol/)协议的高仿真用户行为模拟器。

借鉴于puppeteer，选择重写是因为在实际应用中puppeteer存在各种奇怪的bug，导致线程阻塞且难以被修复。另外，puppeteer并没有完整的支持chrome devtools协议，又缺乏可扩展性、灵活性和易用性，一些实现细节也并不符合预期。

chrome devtools协议api过于原始，对开发者而言显得非常繁琐。puppeteer api在设计上大量延用了chrome devtools协议的原始风格，虽然在功能丰富，但是易用性却很糟糕。

auto-chrome以简洁和易用为设计原则，重点简化常见应用场景，只提供基础功能，通过扩展的方式满足定制化需求。


## 特性

* 自动切换标签，根据当前活跃标签自动聚焦，通过chrome.page获取当前处于激活状态的标签。这在实际应用中避免了多标签切换带来的苦恼，同时减少手动切换标签导致的混乱。

* 解除鼠标、键盘、触控输入设备与页面的绑定，避免频繁在多个页面间切换设备。

* 支持高仿真输入，模拟鼠标移动轨迹和Touch手势。

* 简化的错误处理机制，即使任务出现异常依然能继续运行，尽可能保障线程不出现持久性阻塞。

* 隐藏了taget的概念，只需要直观的面对浏览器和标签和网页即可。


## chromium安装和使用

由于网络环境因素，auto-chrome并没有像puppeteer那样直接将chromium作为npm依赖进行安装。因此你需要手动下载chromium，并在launch.executablePath配置项中指定安装路径。

推荐源：https://npm.taobao.org/mirrors/chromium-browser-snapshots/


## chrome devtools术语

* `Chrome` 表示浏览器实例

* `Session` session机制用于创建多个会话，可以为每个Target绑定独立的session，也可以让多个Target共享同一个session。

* `Target` target可分为browser、page、iframe、other类型，单个Page中允许包含多个Target，同一个时间点上始终只有一个Target处于激活状态。

* `Page` 表示浏览器标签，单个Chrome中允许包含多个Page，同一个时间点上始终只有一个Page处于激活状态。

* `Frame` 表示Target中的框架，主Frame中允许包含多个子Frame

* `Context` 为了区分同一个Page中多个不同的网页、域名、框架，因此需要为这些对象分配唯一上下文。同一个域下的网页contextId从1开始递增，切换域时contextId初始化重新从1开始计数

* `Runtime` JavaScript运行时，通过向网页注入js代码实现对dom的操作


## API

### class: Chrome

#### chrome.mouse

鼠标操作，page.mouse的快捷引用

#### chrome.keyboard

鼠标操作，page.keyboard的快捷引用

#### chrome.touchscreen

触控设备操作，page.touchscreen的快捷引用

#### chrome.pages

包含所有打开状态的Map对象

#### chrome.page

当前激活状态的page

#### chrome.newPage(url)

* url `String` 打开网页地址，缺省时打开空白网页

#### chrome.closePage(pageId)

* pageId `String` 要删除page的id

#### chrome.send(method, params)

发送原始的chrome devtools协议消息

* method `String` 方法名

* params `Object` 参数

#### chrome.close()

关闭浏览器



### class: Page

#### page.mouse

鼠标

#### page.keyboard

键盘

#### page.touchscreen

触控设备

#### page.goto(url)

在标签内打开新网页

### page.evaluate(pageFunction, arg, arg, ...)

向页面注入js函数，获取执行后的返回值

* pageFunction `Function` 注入函数

* arg `*` 可序列化参数，不支持函数

### page.focus(selector)

通过CSS选择器聚焦元素

* selector `String` CSS选择器

### page.getBoundingRect(selector)

通过CSS选择器获取元素坐标，值由getBoundingClientRect()函数获取

* selector `String` CSS选择器

### page.click(selector)

通过CSS选择器点击元素

* selector `String` CSS选择器

### page.type(selector, text, options)

通过CSS选择器聚焦input，输入文本

* selector `String` CSS选择器

* text `String` 输入文本

* options `Object` 配置信息

* options.delay `Number` 输入间隔时间，ms


#### page.send(method, params)

发送包含session的原始chrome devtools协议消息

* method `String` 方法名

* params `Object` 参数

#### page.close()

关闭标签


<!-- #### page.touchScroll(x, y, options)

通过touch滚动页面至指定的可视坐标

* x `Number` 目标x坐标

* y `Number` 目标y坐标

* options `Object`
   * interval `Number` 连续滑动的时间间隔，默认2000，单位ms

#### page.$touchScroll(selector, options)

通过touch方式，滚动页面至指定元素可视区

* selector `String` CSS选择器字符串

* options `Object`
   * steps `Number` touchmove的触发次数，默认50
   * interval `Number` 连续滑动的时间间隔，默认2000，单位ms


#### page.scroll(x, y)

滚动页面，使指定元素位于可视区

* x `Number` 相对于浏览器窗口x坐标

* y `Number` 相对于浏览器窗口y坐标


#### page.$scroll(selector)

滚动页面，使指定元素位于可视区

* selector `String` CSS选择器字符串 -->



### class: Mouse

#### mouse.click(x, y, options)

新增模拟鼠标移动轨迹，原click可能出于效率考虑，只会触发一次mousemoved

click操作中已经包含了move，多数情况下不再需要单独模拟move操作，除非只移动鼠标而不需要点击

* options `Object`
   * steps `Number` mousemoved事件的触发次数，默认20


#### mouse.move(x, y, options)

将steps默认值改为20，原值为1，即只触发一次。移动距离相同时，触发次数越少，对应的移动速度越快

* options `Object`
   * steps `Number` 触发mousemoved事件的次数，默认值20



#### mouse.scroll(x, y, step)

滚动至指定坐标，目前仅支持纵向滚动

* x `Number` 横向坐标，0

* y `Number` 纵向坐标

* step `Number` 步长



### class: Touchscreen

#### touchscreen.slide({start, end, steps})

模拟touch单点滑动手势

* start `Object`
   * x `Number touchstart` x坐标
   * y `Number touchstart` y坐标
* end `Object`
   * x `Number touchend` x坐标
   * y `Number touchend` y坐标
* steps `Number` touchmove的触发次数
* delay `Number` 触点释放前的停留时间，用于滑动惯性控制