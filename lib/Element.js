"use strict";

const consoln = require('consoln');
const { sleep } = require('./helper.js');

/**
 * 用于实现可追溯的远程elment，实际上是devtools保存了注入函数的执行结果并生成查询id
 * 通过状态跟踪，可以在已有远程结果基于上做增量操作，避免了代码的重复提交和执行
 */
class Element {
  /**
   * @param {Function} page page实例
   * @param {Object} remote 节点远程对象
   */
  constructor(page, remote) {

    this.page = page;

    this.frame = page.frame;

    if (remote) {

      const { objectId, description, className } = remote;

      this.objectId = objectId;
      this.description = description;
      this.className = className;

    }

  }
  /**
   * 创建新的Element实例
   * @param {Object} remote 远程资源对象
   */
  create(remote) {

    return new Element(this.page, remote);

  }
  /**
   * CSS单选迭代选择器
   * @param {String} selector 
   */
  async $(selector) {

    const { objectId } = this;

    const remote = await this.frame.callFunctionOn({
      functionDeclaration: (element = document, selector) => {
        // console.log(element);
        // console.log(selector);
        return element.querySelector(selector);
      },
      arguments: [{ objectId }, { value: selector }]
    });

    const { className, description } = remote;

    if (className === 'TypeError') {

      consoln.warn(new Error(description));

      return

    }

    if (remote.objectId) {

      return this.create(remote); // 创建新的远程子节点实例

    }

  }
  /**
   * CSS多选迭代选择器
   * @param {String} selector 
   */
  async $$(selector) {

    const { objectId } = this;

    const remote = await this.frame.callFunctionOn({
      functionDeclaration: (element = document, selector) => {
        return element.querySelectorAll(selector)
      },
      arguments: [{ objectId }, { value: selector }]
    });

    const { className, description } = remote;

    if (className === 'TypeError') {
      consoln.warn(new Error(description));
      return
    }

    if (remote.objectId) {

      const { result } = await this.page.send('Runtime.getProperties', {
        objectId: remote.objectId,
        "ownProperties": true
      })

      const elements = [];

      // 批量创建子节点实例
      for (const item of result) {

        const { enumerable, value } = item;

        if (enumerable === true) {
          const element = this.create(value);
          elements.push(element);
        }

      }

      elements.objectId = remote.objectId;

      return elements;

    }

  }
  /**
   * 取值
   * @param {string} path 对象路径，仅支持“.”对象表达式，不支持“[index]”数组
   */
  async get(path) {

    const { objectId } = this;

    const result = await this.frame.callFunctionOn({
      functionDeclaration: (element, path) => {
        const pathArray = path.split('.');
        let iterate = element;
        for (const item of pathArray) {
          iterate = iterate[item];
        }
        return iterate;
      },
      arguments: [{ objectId }, { value: path }]
    })

    return result.value;

  }
  /**
   * 设置值
   * @param {String} name 属性名称
   * @param {*} value 属性值
   */
  async set(name, value) {

    const { objectId } = this;

    const result = await this.frame.callFunctionOn({
      functionDeclaration: (element, name, value) => {
        return element[name] = value;
      },
      arguments: [{ objectId }, { value: name }, { value }]
    })

    return result.value;

  }
  /**
   * 获取或设置值，仅适用于input元素
   * @param {*} value 赋值
   */
  async value(value) {

    const { objectId } = this;

    if (value) {

      const result = await this.frame.callFunctionOn({
        functionDeclaration: (element, value) => {
          return element.value = value
        },
        arguments: [{ objectId }, { value }]
      })

      return result.value;

    } else {

      const result = await this.frame.callFunctionOn({
        functionDeclaration: element => element.value,
        arguments: [{ objectId }]
      })

      return result.value;

    }

  }
  /**
   * 键盘输入
   * @param {*} text 输入文本
   * @param {*} options 附加选项
   */
  async type(text, options) {

    return await this.page.keyboard.type(text, options)

  }
  /**
   * 获取元素坐标信息
   */
  async getBoundingRect() {

    const { objectId } = this;

    const result = await this.frame.callFunctionOn({
      functionDeclaration: element => {
        const { x, y, width, height } = element.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;
        return {
          x,
          y,
          width,
          height,
          innerHeight,
          innerWidth
        }
      },
      arguments: [{ objectId }],
      returnByValue: true
    });

    return result.value;

  }

  /**
   * 分多次滚动页面至目标元素可视区域
   * 在每个单次滚动后重新计数坐标，防止DOM更新后原坐标失效
   * 当chrome不稳定导致事件未执行时，采用实时坐标提供了纠正错误的机会
   */
  async scroll() {

    const bounding = await this.getBoundingRect();

    const isNext = await this.page.clicker.scrollBounding(bounding);

    // 返回值next为true时表继续递归
    if (isNext === true) {

      await this.scroll();

    }

  }

  /**
   * 快速将元素滚动至可视区域
   */
  async scrollIntoView() {

    const { objectId } = this;

    await this.frame.callFunctionOn({
      functionDeclaration: element => {
        element.scrollIntoView();
      },
      arguments: [{ objectId }]
    })

    await sleep(600);

  }

  /**
   * 仿真点击元素
   */
  async click() {

    // await this.label()

    const result = await this.getBoundingRect();

    let { x, y, width, height } = result;

    // 定位到元素中心
    x = x + width / 2;
    y = y + height / 2;

    await this.page.clicker.click(x, y);

    return result;

  }
  /**
   * 带导航的仿真点击元素
   * @param {number} time 导航限时
   */
  async clickNav(time = 3000) {

    const result = await this.getBoundingRect();

    let { x, y, width, height } = result;

    // 定位到元素中心
    x = x + width / 2;
    y = y + height / 2;

    await Promise.all([
      this.page.chrome.autoNav(time),
      this.page.clicker.click(x, y)
    ]).catch(error => {
      consoln.error(error);
      throw error;
    })

    return result;

  }
  
  /**
    * 直接在Dom上调用click()方法，触发点击事件
    * @param {object} options 配置项
    * @param {object} options.target 新窗口打开
    */
  async clickDom({ target = true }) {

    const { objectId } = this;

    await Promise.all([
      this.frame.callFunctionOn({
        functionDeclaration: (element, target) => {
          if (target) {
            element.target = "_blank";
          }
          element.click();
        },
        arguments: [{ objectId }, { value: target }]
      }),
      this.page.chrome.autoNav()
    ]).catch(error => {
      consoln.error(error);
      throw error;
    });

  }

  /**
   * 框选元素
   */
  async label() {

    const { objectId } = this;

    await this.frame.callFunctionOn({
      functionDeclaration: element => {
        element.style.border = "1px solid #ed0000"
      },
      arguments: [{ objectId }]
    })

    await sleep(500);

  }

}

module.exports = Element;
