import * as _ from "lodash"
$ = window.$ = window.jQuery = require('jquery')
import {DateTime} from 'luxon'
import tippy from 'tippy.js'
import weui from 'weui.js'
import Vue from '../node_modules/vue/dist/vue.esm.js'

import {tasks, frequencyOptionText, findJobPlatform} from './tasks'
import {getSetting, versionCompare, readableTime} from './utils'
import {getLoginState} from './account'

Vue.directive('tippy', {
  bind(el) {
    let title = el.getAttribute('title')
    if (title) {
      tippy(el, {
        content: title
      })
    }
  }
})

Vue.directive('autoSave', {
  bind(el, binding) {
    function revertValue(el) {
      let current = getSetting(el.name, null);
      if (el.type == 'checkbox') {
        if (current == "checked") {
          el.checked = true
        } else {
          el.checked = false
        }
      } else if (el.type == 'select-one'){
        el.value = current || el.options[0].value
      } else {
        el.value = current
      }
    }
    function saveToLocalStorage(el) {
      if (el.type == 'checkbox') {
        if (el.checked) {
          localStorage.setItem(el.name, "checked")
        } else {
          localStorage.removeItem(el.name)
        }
      } else {
        localStorage.setItem(el.name, el.value)
      }
      weui.toast("设置已保存", 500)
    }
    revertValue(el)
    el.addEventListener('change', function(event) {
      if (binding.value && binding.value.notice && el.checked) {
        weui.confirm(binding.value.notice, function(){
          saveToLocalStorage(el)
        }, function(){
          event.preventDefault();
          setTimeout(() => {
            revertValue(el)
          }, 50);
        }, {
          title: '选项确认'
        });
      } else {
        saveToLocalStorage(el)
      }
    });
  }
})

$.each(['show', 'hide'], function (i, ev) {
  var el = $.fn[ev];
  $.fn[ev] = function () {
    this.trigger(ev);
    return el.apply(this, arguments);
  };
});

let rewards = [
  '给开发者加个鸡腿',
  '请开发者喝杯咖啡',
  '京价保就是好',
  '保价成功，感谢开发者',
  '返利到手，打赏开发者',
  '赞赏支持',
  '打赏声优'
]

let notices = [
  {
    text: '成功申请到价保、领取到返利或者有功能建议欢迎打赏附言。',
    type: 'reward',
    button: rewards[3],
    target: 'ming'
  },
  {
    text: '理想情况下京价保每月仅各种签到任务即可带来5元以上的等同现金收益。',
    button: rewards[2],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京东页面经常修改，唯有你的支持才能让京价保保持更新持续运作。',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京价保所有的功能均在本地完成，不会上传任何信息给任何人。',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京价保部分功能会开启一个固定的标签页，过一会儿它会自动关掉，不必紧张。',
    button: rewards[1],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京东的登录有效期很短，请在登录时勾选保存密码自动登录以便京价保自动完成工作。',
    button: rewards[0],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京价保全部代码已上传到GitHub，欢迎审查代码，了解京价保如何工作。',
    button: rewards[0],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '软件开发需要开发者付出劳动和智慧，每一行代码都要付出相应的工作，并非唾手可得。',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '京价保并不强制付费，但如果它确实帮到你，希望你也能帮助它保持更新。',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '许多开源项目因为缺乏支持而停止更新，如果你希望京价保保持更新，请赞赏支持。',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '如果你的京东账号修改了密码，请在高级设置中选择清除密码重新登录来继续使用京价保',
    button: rewards[5],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '把京价保推荐给你的朋友同样能帮助京价保保持更新，如果缺乏使用者，开发者可能会放弃维护项目。',
    button: rewards[2],
    type: 'reward',
    target: 'ming'
  },
  {
    text: '如果价保成功的话，打赏声优小姐姐几块钱她会很开心哦',
    button: rewards[6],
    type: 'reward',
    target: 'samedi'
  }
]

// 设置模块
var settingsVM = new Vue({
  el: '#settings',
  data: {
    tasks: [],
    frequencyOptionText: frequencyOptionText,
    recommendedLinks: [],
    loginState: {
      m: {
        state: "unknown"
      },
      pc: {
        state: "unknown"
      }
    }
  },
  methods: {
    showLoginState: function () {
      $("#loginNotice").show()
    },
    retryTask: function (task) {
      console.log('retryTask', task)
      chrome.runtime.sendMessage({
        action: "runTask",
        taskId: task.id
      }, function(response) {
        weui.toast('手动运行成功', 3000);
        console.log("runJob Response: ", response);
      });
    }
  }
})

// 处理订单
var ordersVM = new Vue({
  el: '#orders',
  data: {
    orders: [],
    skuPriceList: {},
    hiddenOrderIds: getSetting('hiddenOrderIds', []),
    disabled_link: getSetting('disabled_link') == 'checked' ? true : false
  },
  methods: {
    backup_picture: function (e) {
      e.currentTarget.src = "https://jjbcdn.zaoshu.so/web/img_error.png"
    },
    toggleOrder: function (order) {
      if (_.indexOf(this.hiddenOrderIds, order.id) > -1) {
        this.hiddenOrderIds = _.pull(this.hiddenOrderIds, order.id);
      } else {
        this.hiddenOrderIds.push(order.id)
      }
      localStorage.setItem('hiddenOrderIds', JSON.stringify(this.hiddenOrderIds))
      this.$forceUpdate()
    },
  }
})

// 通知消息
var messagesVM = new Vue({
  el: '#messages',
  data: {
    selectedTab: null,
    messages: [],
  },
  methods: {
    selectType: function (type) {
      this.selectedTab = type
    }
  }
})

// 接收消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'orders_updated':
      let orders = JSON.parse(message.data).map(function (order) {
        order.displayTime = readableTime(DateTime.fromISO(order.time))
        return order
      })
      ordersVM.orders = orders
      break;
    case 'new_message':
      let lastUnreadCount = $("#unreadCount").text()
      $("#unreadCount").text(Number(lastUnreadCount) + 1).fadeIn()
      messagesVM.messages = makeupMessages(JSON.parse(message.data))
      break;
    case 'loginState_updated':
      dealWithLoginState()
      break;
    default:
      break;
  }
});

function switchWechat(target) {
  let to = target || 'ming'
  if (to == 'samedi') {
    $("#dialogs .weixin_pay .ming").hide()
    $("#dialogs .weixin_pay .samedi").show()
  } else {
    $("#dialogs .weixin_pay .ming").show()
    $("#dialogs .weixin_pay .samedi").hide()
  }
}

function switchAlipay(target) {
  let to = target || ($("#dialogs .alipay_pay .alipay").is(':visible') ? 'redpack' : 'alipay')
  if (to == 'redpack') {
    console.log('show redpack')
    $("#dialogs .alipay_pay .alipay").hide()
    $("#dialogs .alipay_pay .redpack").show()
  } else {
    console.log('show alipay')
    $("#dialogs .alipay_pay .redpack").hide()
    $("#dialogs .alipay_pay .alipay").show()
  }
}

function showReward() {
  switchPayMethod('weixin')
  let time = Date.now().toString()
  if (time[time.length - 1] < 3) {
    setTimeout(() => {
      switchPayMethod('alipay')
    }, 50);
  }
}


function switchPayMethod(payMethod, target) {
  $("#dialogs").show()
  if (payMethod == 'weixin') {
    $('.segmented-control .weixin').addClass('checked')
    $('.segmented-control .alipay').removeClass('checked')
    $('.weixin_pay').show()
    $('.alipay_pay').hide()
    switchWechat(target)
  } else {
    $('.segmented-control .weixin').removeClass('checked')
    $('.segmented-control .alipay').addClass('checked')
    $('.weixin_pay').hide()
    $('.alipay_pay').show()
    switchAlipay(target)
  }
}

// 试听通知
function listenVoice(type, batch) {
  chrome.runtime.sendMessage({
    text: type,
    batch: batch,
    test: true,
    title: "京价保通知试听",
    content: "并没有钱，这只是假象，你不要太当真"
  }, function (response) {
    console.log("Response: ", response);
  });
}

// 换 Tips
function changeTips() {
  let announcements = (localStorage.getItem('announcements') ? JSON.parse(localStorage.getItem('announcements')) : []).concat(notices)
  let tip = announcements[Math.floor(Math.random() * announcements.length)]
  $("#notice").text(tip.text)
  if (tip.type == "reward" && tip.button) {
    $("#notice").removeAttr("href")
    $("#notice").removeAttr("target")
    $(".tips .weui-btn").css("display", "inline-block")
    $(".tips .weui-btn").addClass("switch-paymethod")
    $(".tips .weui-btn").text(tip.button)
    $(".tips .weui-btn").data('target', tip.target)
  }
  if (tip.type == "link") {
    if (tip.button) {
      $(".tips .weui-btn").removeClass("switch-paymethod")
      $(".tips .weui-btn").css("display", "inline-block")
      $(".tips .weui-btn").text(tip.button)
      $(".tips .weui-btn").attr("href", tip.url)
      $(".tips .weui-btn").attr("target", "_blank")
    } else {
      $(".tips .weui-btn").hide()
    }
    $("#notice").attr("href", tip.url)
    $("#notice").attr("target", "_blank")
  }
  if (tip.type == "link" && tip.mode == "mobliepage") {
    if (tip.button) {
      $(".tips .weui-btn").removeClass("switch-paymethod")
      $(".tips .weui-btn").addClass("openMobliePage")
      $(".tips .weui-btn").attr("data-url", tip.url)
      $(".tips .weui-btn").removeAttr("href")
      $(".tips .weui-btn").removeAttr("target")
    }
    $("#notice").removeAttr("href")
    $("#notice").attr("data-url", tip.url)
    $("#notice").addClass("openMobliePage")
  }
}

function showJEvent(rateLimit) {
  if (rateLimit) {
    let today = DateTime.local().toFormat("o")
    let showRecommendState = getSetting('showRecommendState', {
      date: today,
      times: 0
    })
    if (showRecommendState.date == today) {
      if (showRecommendState.times > rateLimit.limit) {
        return console.log('展示次数超限')
      } else {
        showRecommendState.times = showRecommendState.times + 1
      }
    } else {
      showRecommendState.date = today
      showRecommendState.times = 1
    }
    localStorage.setItem('showRecommendState', JSON.stringify(showRecommendState))
  }
  // 加载反馈
  if (!$("#jEventIframe").attr('src') || $("#jEventIframe").attr('src') == '') {
    $("#jEventIframe").attr('src', "https://jjb.zaoshu.so/recommend")
    setTimeout(function () {
      $('.iframe-loading').hide()
    }, 800)
  }
  $("#jEventDialags").show()
}

// 任务列表
function getTaskList() {
  return _.map(tasks, (task) => {
    task.last_run_at = getSetting('job' + task.id + '_lasttime', null)
    task.frequencySetting = getSetting('job' + task.id + '_frequency', task.frequency)
    task.last_run_description = task.last_run_at ?'上次运行： ' + readableTime(DateTime.fromMillis(Number(task.last_run_at))) : '从未执行'
    // 如果是签到任务，则读取签到状态
    if (task.checkin) {
      let checkinRecord = getSetting('jjb_checkin_' + task.key, null)
      if (checkinRecord && checkinRecord.date == DateTime.local().toFormat("o")) {
        task.checked = true
        task.checkin_description = '完成于：' + readableTime(DateTime.fromISO(checkinRecord.time)) + ( checkinRecord.value ? '，领到：' + checkinRecord.value : '')
      }
    }
    // 选择运行平台
    task.platform = findJobPlatform(task)
    if (!task.url) {
      task.url = task.platform ? task.src[task.platform] : task.src[task.type[0]]
    }
    if (!task.platform) {
      task.suspended = true
    }
    return task
  })
}

// 处理登录状态
function dealWithLoginState() {
  let stateText = {
    "failed": "失败",
    "alive": "有效",
    "unknown": "未知"
  }
  function getStateDescription(loginState, type) {
    return stateText[loginState[type].state] + (loginState[type].message ? `（ ${loginState[type].message} 上次检查： ${readableTime(DateTime.fromISO(loginState[type].time))} ）` : '')
  }
  function dealWithLoginNotice(loginState, type) {
    let loginTypeNoticeDom = $('.login-type_' + type)
    let loginUrl = loginTypeNoticeDom.data("url")
    let stateDescription = "当前登录状态未知，可点击登录"
    if (loginState[type] && loginState[type].state != "unknown") {
      stateDescription = "当前登录状态" + getStateDescription(loginState, type)
    }
    loginTypeNoticeDom.removeClass("alive").removeClass("failed").addClass(loginState[type].state)
    if (loginTypeNoticeDom[0]._tippy) {
      loginTypeNoticeDom[0]._tippy.setContent(stateDescription)
    }
    $('.login-type_' + type + ' .status-text').text(stateText[loginState[type].state])
    if (!loginState[type] || loginState[type].state != "alive") {
      if (loginUrl && type != 'm') {
        loginTypeNoticeDom.attr("href", loginUrl)
        loginTypeNoticeDom.attr("target", "_blank")
      }
    } 
  }
  let loginState = getLoginState()
  settingsVM.loginState = loginState
  settingsVM.tasks = getTaskList()

  dealWithLoginNotice(loginState, 'pc')
  dealWithLoginNotice(loginState, 'm')
  $("#loginState")[0]._tippy.setContent("PC网页版登录" + getStateDescription(loginState, 'pc') + "，移动网页版登录" + getStateDescription(loginState, 'm'))
  $("#loginState").removeClass("alive").removeClass("failed").removeClass("warning")
  $("#loginState").addClass(loginState.class)
  $("#loginNotice").addClass('state-' + loginState.class)
  // 登录提醒
  switch (loginState.class) {
    case "alive":
      $("#loginNotice").hide()
      $("#login").hide()
      $("#loginNotice .title strong").text("太好了，账号登录状态有效")
      break;
    case "warning":
      $("#loginNotice").hide()
      break;
    case "failed":
      $("#loginNotice").show()
      break;
    default:
      break;
  }
}

function makeupMessages(messages) {
  if (messages) {
    return messages.reverse().map(function (message) {
      if (message.type == 'coupon') {
        message.coupon = JSON.parse(message.content)
      }
      message.time = readableTime(DateTime.fromISO(message.time))
      return message
    })
  } else {
    return []
  }
}


function getOrders() {
  let orders = JSON.parse(localStorage.getItem('jjb_orders'))
  let skuPriceList = getSetting('skuPriceList', {})
  if (orders) {
    orders = orders.map(function (order) {
      order.displayTime = readableTime(DateTime.fromISO(order.time))
      return order
    })
  } else {
    orders = []
  }
  ordersVM.orders = orders
  ordersVM.skuPriceList = skuPriceList
}

function getMessages() {
  let messages = JSON.parse(localStorage.getItem('jjb_messages'))
  messages = makeupMessages(messages)
  messagesVM.messages = messages
}

$( document ).ready(function() {
  var paid = localStorage.getItem('jjb_paid');
  var account = localStorage.getItem('jjb_account');
  var admission_test = localStorage.getItem('jjb_admission-test')
  var unreadCount = localStorage.getItem('unreadCount') || 0
  const changelog_version = localStorage.getItem('changelog_version')
  const displayRecommend = localStorage.getItem('displayRecommend')
  const displayRecommendRateLimit = getSetting('displayRecommendRateLimit', {
    rate: 7,
    limit: 1
  })
  const current_version = "{{version}}"
  let windowWidth = Number(document.body.offsetWidth)
  let time = Date.now().toString()
  
  // 渲染订单
  getOrders()

  // 渲染通知
  getMessages()

  // 渲染设置
  settingsVM.tasks = getTaskList()
  settingsVM.recommendedLinks = getSetting("recommendedLinks", [])
  
  // tippy
  tippy('.tippy')

  // 处理登录状态
  dealWithLoginState()

  // 随机显示 Tips
  changeTips()

  $('body').width(windowWidth-1)
  // 窗口 resize
  setTimeout(() => {
    $('body').width(windowWidth)
  }, 100);

  if (unreadCount > 0) {
    $("#unreadCount").text(unreadCount).fadeIn()
  }

  // 查询推荐设置
  $.getJSON("https://jjb.zaoshu.so/recommend/settings", function (json) {
    if (json.display) {
      localStorage.setItem('displayRecommend', json.display)
    }
    if (json.ratelimit) {
      localStorage.setItem('displayRecommendRateLimit', JSON.stringify(json.ratelimit))
    }
    if (json.announcements && json.announcements.length > 0) {
      localStorage.setItem('announcements', JSON.stringify(json.announcements))
    }
    if (json.recommendedLinks && json.recommendedLinks.length > 0) {
      localStorage.setItem('recommendedLinks', JSON.stringify(json.recommendedLinks))
    }
  });

  // 查询最新版本
  $.getJSON("https://jjb.zaoshu.so/updates/check?version={{version}}&browser={{browser}}", function (json) {
    let skipVerison = localStorage.getItem('skipVerison')
    let localVerison = skipVerison || "{{version}}"
    if (versionCompare(localVerison, json.lastVerison) < 0  && json.notice && versionCompare(localVerison, json.noticeVerison) < 1) {
      weui.dialog({
        title: json.title || '京价保有版本更新',
        content: json.changelog || '一系列改进',
        className: 'update',
        buttons: [{
          label: '不再提醒',
          type: 'default',
          onClick: function () {
            localStorage.setItem('skipVerison', json.lastVerison)
          }
        }, {
          label: '下载更新',
          type: 'primary',
          onClick: function () {
            chrome.tabs.create({
              url: json.url || "https://jjb.zaoshu.so/updates/latest?browser={{browser}}"
            })
          }
        }]
      });
    }
  });

  // 是否已存在弹窗
  function isNoDialog(){
    return ($(".js_dialog:visible").length < 1) && ($(".weui-dialog:visible").length < 1)
  }

  // 入学考试
  function showTest(target) {
    let testNo = target || '1'
    $("#admissionTest .testbox").hide()
    setTimeout(() => {
      $("#admissionTest .test-" + testNo).show()
    }, 50);
  }

  if (admission_test && admission_test == 'N') {
    $("#admissionTest").show()
    $("img.jjb-official").attr('src', "http://jjbcdn.zaoshu.so/wechat/qrcode_for_gh_21550d50400c_430.jpg")
    $("#admissionTest .answer").on("click", function () {
      let next = $(this).data('next')
      if (next) {
        showTest(next)
      } else {
        $("#admissionTest").hide()
        localStorage.setItem('jjb_admission-test', 'Y');
      }
    })
    $("#admissionTest .dismiss").on("click", function () {
      $("#admissionTest").hide()
      window.close();
    })
    showTest()
  }

  // 常规弹窗延迟200ms
  setTimeout(() => {
    if (paid) {
      $("#dialogs").hide()
    } else {
      if (isNoDialog() && time[time.length - 1] < 4) {
        showReward()
      }
    }
    // 只有在没有弹框 且 打开了推荐 取 1/5 的几率弹出推荐
    if (isNoDialog() && displayRecommend == 'true' && time[time.length - 1] > displayRecommendRateLimit.rate) {
      showJEvent(displayRecommendRateLimit)
    }
    // 如果当前没有弹框 且 需要展示changelog
    if (isNoDialog() && changelog_version != current_version) {
      localStorage.setItem('changelog_version', $("#changeLogs").data('version'))
      if ($("#changeLogs").data('major') == 'Y') {
        $("#changeLogs").show()
      }
    }

    if (!account) {
      $("#clearAccount").addClass('weui-btn_disabled')
    }
  }, 200);


  $('.settings .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    $('.settings_box').hide()
    $('.settings_box.' + type).show()
  });

  // 授权
  $('.settings .request-permissions-icon').on('click', function () {
    let permissions = $(this).data('permissions')
    chrome.runtime.sendMessage({
      text: "requestPermissions",
      permissions: permissions
    }, function (response) {
      if (response.granted) {
        weui.toast('授权成功', 3000);
      } else {
        weui.alert('授权失败');
      }
    });
  });
  
  $('.contents .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    if (type == 'messages') {
      $("#unreadCount").fadeOut()
      chrome.runtime.sendMessage({
        text: "clearUnread"
      }, function (response) {
        console.log("Response: ", response);
      });
    }
    $('.contents-box').hide()
    $('.contents-box.' + type).show()
  });

  $("#recommendCardDialags .weui-dialog .switch-cardbank").click(function () {
    var bank = $(this).data('bank')
    $('#recommendCardDialags .segmented-control__item').removeClass('checked')
    $(this).parent().addClass('checked')
    $('.card-box').each(function () {
      if ($(this).hasClass(bank)){
        $(this).show()
      } else {
        $(this).hide()
      }
    });
  });

  $(".weui-dialog__ft a").on("click", function () {
    $("#dialogs").hide()
    $("#listenAudio").hide()
    $("#loginNotice").hide()
    $("#changeLogs").hide()
    if ($(this).data('action') == 'paid') {
      chrome.runtime.sendMessage({
        text: "paid"
      }, function(response) {
        console.log("Response: ", response);
      });
    } else {
      if ($(this).data('action') == 'pay') {
        showReward()
      }
    }
  })

  $("#listen").on("click", function () {
    $("#listenAudio").show()
  })

  $("#know_more").on("click", function () {
    $("#loginNotice .detail").show()
    $("#know_more").hide()
  })

  $(".switch-paymethod").on("click", function () {
    let to = $(this).data('to')
    let target = $(this).data('target')
    if ($(this).hasClass('switch-paymethod')){
      switchPayMethod(to, target)
    }
  })

  $(".showChangeLog").on("click", function () {
    localStorage.setItem('changelog_version', $("#changeLogs").data('version'))
    $("#changeLogs").show()
  })

  $("#openRecommendCard").on("click", function () {
    $("#recommendCardDialags").show()
  })

  $("#openWechatCard").on("click", function () {
    $("img.jjb-official").attr('src', "http://jjbcdn.zaoshu.so/wechat/qrcode_for_gh_21550d50400c_430.jpg")
    $("#wechatDialags").show()
  })

  $("#openjEventCard").on("click", function () {
    showJEvent()
  })

  $(document).on("click", ".openMobliePage", function () {
    chrome.runtime.sendMessage({
      text: "openUrlAsMoblie",
      url: $(this).data('url')
    }, function (response) {
      console.log("Response: ", response);
    });
  })

  $(".showLoginState").on("click", function () {
    $("#loginNotice").show()
  })

  $("#openFeedback").on("click", function () {
    // 加载反馈
    if ($("#feedbackIframe").attr('src') == '') {
      $("#feedbackIframe").attr('src', "https://i.duotai.net/forms/yovwz?version={{version}}")
      setTimeout(function () {
        $('.iframe-loading').hide()
      }, 800)
    }
    $("#feedbackDialags").show()
  })

  $("#openFaq").on("click", function () {
    // 加载反馈
    if ($("#faqIframe").attr('src') == '') {
      $("#faqIframe").attr('src', "https://i.duotai.net/forms/oqyvk/1lpb11l2")
      setTimeout(function () {
        $('.iframe-loading').hide()
      }, 800)
    }
    $("#faqDialags").show()
  })

  $("#clearPinnedTabs").on("click", function () {
    chrome.tabs.query({
      pinned: true
    }, function (tabs) {
      var tabIds = $.map(tabs, function (tab) {
        if (tab && tab.url.indexOf('jd.com') !== -1) {
            return tab.id
        }
      })

      // opera doesn't remove pinned tabs, so lets first unpin
      $.map(tabIds, function (tabId) {
        chrome.tabs.update(tabId, {"pinned":false}, function(theTab){ chrome.tabs.remove(theTab.id); });
      })
    })
  })

  $("#feedbackDialags .js-close").on("click", function () {
    $("#feedbackDialags").hide()
  })

  $("#faqDialags .js-close").on("click", function () {
    $("#faqDialags").hide()
  })

  $("#jEventDialags .js-close").on("click", function () {
    $("#jEventDialags").hide()
  })

  $("#recommendCardDialags .js-close").on("click", function () {
    $("#recommendCardDialags").hide()
  })

  $("#dialogs .js-close").on("click", function () {
    $("#dialogs").hide()
  })

  $("#wechatDialags .js-close").on("click", function () {
    $("#wechatDialags").hide()
  })

  $("#clearAccount").on("click", function () {
    weui.confirm('清除密码将移除本地存储的账号密码、订单记录、消息记录；清除后若需继续使用请重新登录并选择让京价保记住密码', function () {
      localStorage.removeItem('jjb_account')
      localStorage.removeItem('jjb_orders')
      localStorage.removeItem('jjb_messages')
      chrome.tabs.create({
        url: "https://passport.jd.com/uc/login"
      })
    }, function () {
      console.log('取消清除')
    }, {
      title: '清除密码确认'
    });
    
  })


  $("#login").on("click", function () {
    chrome.runtime.sendMessage({
      text: "openLogin",
    }, function(response) {
      console.log("Response: ", response);
    });
  })
  
  $("#notice").on("dblclick", function () {
    changeTips()
  })

  $("#pricePro").on("click", function () {
    chrome.runtime.sendMessage({
      text: "openPricePro"
    }, function (response) {
      console.log("Response: ", response);
    })
  })

  $(".listenVoice").on("click", function () {
    listenVoice($(this).data('type'), $(this).data('batch'))
  })
})