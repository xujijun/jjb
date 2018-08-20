(function ($) {
  $.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
      this.trigger(ev);
      return el.apply(this, arguments);
    };
  });
})(jQuery);

let checkinTasks = ['jr-index', 'jr-qyy', 'vip', 'jdpay', 'bean', 'double_check', 'm_welfare', 'coin']

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
    text: '如果每个京价保的用户都能每个月赞赏5元，开发者就能投入更多时间维护京价保，增加更多实用功能。',
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

function getSetting(settingKey) {
  let setting = localStorage.getItem(settingKey)
  try {
    setting = JSON.parse(setting)
  } catch (error) {}
  return setting
}

// 设置保存
$('#settings').garlic({
  getPath: function ($elem) {
    return $elem.attr('name');
  }
});

// 接收消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action == 'orders_updated') {
    renderOrders(JSON.parse(message.data))
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

function renderOrders(orders) {
  let disabled_link = getSetting('disabled_link');
  let renderFrame = document.getElementById('renderFrame');
  setTimeout(() => {
    renderFrame.contentWindow.postMessage({
      command: 'render',
      context: {
        name: 'orders',
        orders: orders,
        disabled_link: disabled_link == 'checked' ? true : false
      }
    }, '*');
  }, 500);
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
    switchAlipay('alipay')
  }
}

// 试听通知
function listenVoice(type, batch) {
  chrome.runtime.sendMessage({
    text: type,
    batch: batch,
    test: true,
    title: "【试听】京价保通知试听",
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
}

function showJEvent() {
  // 加载反馈
  if ($("#jEventIframe").attr('src') == '') {
    $("#jEventIframe").attr('src', "https://i.duotai.net/forms/zm5rk/i6svm4on")
    setTimeout(function () {
      $('.iframe-loading').hide()
    }, 800)
  }
  $("#jEventDialags").show()
}


function bindMessageAction() {
  $('.messages-header .Button').on('click', function () {
    let type = $(this).data('type')
    $('.messages-header .Button').removeClass('selectedTab')
    $(this).addClass('selectedTab')
    $('.message-items .message-item').hide()
    $('.message-items').find('.type-' + type).show()
  });
}

function receiveMessage(event) {
  if (event.data.html) {
    switch (event.data.name) {
      case 'orders':
        $('#orders').html(event.data.html)
        break;
      case 'messages':
        $('#messages').html(event.data.html)
        bindMessageAction()
        break;
      default:
        break;
    }
  }
}

// 标记任务状态
function markJobStatus() {
  // 标记上次运行时间
  $(".weui-cell_select").each(function () {
    var job_elem = $(this)
    if (job_elem) {
      var jobId = job_elem.attr('id')
      if (jobId) {
        var last_run_time = localStorage.getItem(jobId + '_lasttime')
        if (last_run_time) {
          job_elem.find('.reload-icon').attr('title', '上次运行： ' + moment(Number(last_run_time)).locale('zh-cn').calendar())
        } else {
          job_elem.find('.reload-icon').attr('title', '从未执行')
        }
      }
    }
  })

  // 标记签到状态
  checkinTasks.forEach(task => {
    let record = localStorage.getItem('jjb_checkin_' + task) ? JSON.parse(localStorage.getItem('jjb_checkin_' + task)) : null
    if (record && record.date == moment().format("DDD")) {
      let title = '完成于：' + moment(record.time).locale('zh-cn').calendar()
      if (record.value) {
        title = title + '，领到：' + record.value
      }
      $(".checkin-" + task).find('.reload').hide()
      $(".checkin-" + task).find('.today').attr('title', title).show()
    }
  });
}

// 处理登录状态
function dealWithLoginState() {
  let stateText = {
    "failed": "失败",
    "alive": "有效",
    "unknown": "未知"
  }
  function getStateDescription(loginState, type) {
    return stateText[loginState[type].state] + "（ " + (loginState[type].message ? loginState[type].message : "") + (loginState[type].time ? " 上次检查： " + moment(loginState[type].time).locale('zh-cn').calendar() : "") + "）"
  }
  function dealWithLoginNotice(loginState, type) {
    let loginTypeNoticeDom = $('.login-type_' + type)
    let loginUrl = loginTypeNoticeDom.data("url")
    let stateDescription = "当前登录状态未知，可点击登录"
    if (loginState[type].state != "unknown") {
      stateDescription = "当前登录状态" + getStateDescription(loginState, type)
    }
    loginTypeNoticeDom.addClass(loginState[type].state)
    loginTypeNoticeDom.attr("title", stateDescription)
    $('.login-type_' + type + ' .status-text').text(stateText[loginState[type].state])
    if (!loginState[type] || loginState[type].state != "alive") {
      $('.frequency_settings .job-' + type + ' .reload').hide()
      $('.frequency_settings .job-' + type + ' .job-state').show()

      if (loginUrl) {
        loginTypeNoticeDom.attr("href", loginUrl)
        loginTypeNoticeDom.attr("target", "_blank")
      }
    }
  }
  function dealResponse(loginState) {
    dealWithLoginNotice(loginState, 'pc')
    dealWithLoginNotice(loginState, 'm')
    $("#loginState").attr("title", "PC网页版登录" + getStateDescription(loginState, 'pc') + "，移动网页版登录" + getStateDescription(loginState, 'm'))
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
  // 获取当前登录状态
  chrome.runtime.sendMessage({
    text: "getLoginState"
  }, function (response) {
    dealResponse(response)
  });
}

$( document ).ready(function() {
  var orders = JSON.parse(localStorage.getItem('jjb_orders'))
  var messages = JSON.parse(localStorage.getItem('jjb_messages'))
  var paid = localStorage.getItem('jjb_paid');
  var account = localStorage.getItem('jjb_account');
  var admission_test = localStorage.getItem('jjb_admission-test')
  var unreadCount = localStorage.getItem('unreadCount') || 0
  var changelog_version = localStorage.getItem('changelog_version')
  var displayRecommend = localStorage.getItem('displayRecommend')
  var current_version = "{{version}}"
  let windowWidth = Number(document.body.offsetWidth)
  let time = Date.now().toString()
  
  // 处理登录状态
  dealWithLoginState()

  // 标记任务状态
  setTimeout(() => {
    markJobStatus()
  }, 50);

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

  $("#renderFrame").attr('src', '/render.html')

  // 查询推荐设置
  $.getJSON("https://jjb.zaoshu.so/recommend/settings", function (json) {
    if (json.display) {
      localStorage.setItem('displayRecommend', json.display)
    }
    if (json.announcements && json.announcements.length > 0) {
      localStorage.setItem('announcements', JSON.stringify(json.announcements))
    }
  });

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

  // 常规弹窗延迟100ms
  setTimeout(() => {
    if (paid) {
      $("#dialogs").hide()
    } else {
      if ($(".js_dialog:visible").length < 1 && time[time.length - 1] < 4) {
        showReward()
      }
    }
    // 只有在没有弹框 且 打开了推荐 取 1/5 的几率弹出推荐
    if ($(".js_dialog:visible").length < 1 && displayRecommend == 'true' && time[time.length - 1] > 7) {
      showJEvent()
    }
    // 如果当前没有弹框 且 需要展示changelog
    if ($(".js_dialog:visible").length < 1 && changelog_version != current_version) {
      localStorage.setItem('changelog_version', $("#changeLogs").data('version'))
      $("#changeLogs").show()
    }

    if (!account) {
      $("#clearAccount").addClass('weui-btn_disabled')
    }
  }, 100);

  // tippy
  setTimeout(function () {
    tippy('.tippy', {
      animation: 'scale',
      duration: 20,
      arrow: true
    })
  }, 800)


  $('.settings .weui-navbar__item').on('click', function () {
    $(this).addClass('weui-bar__item_on').siblings('.weui-bar__item_on').removeClass('weui-bar__item_on');
    var type = $(this).data('type')
    $('.settings_box').hide()
    $('.settings_box.' + type).show()
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

  if (messages) {
    messages = messages.reverse().map(function (message) {
      if (message.type == 'coupon') {
        message.coupon = JSON.parse(message.content)
      }
      message.time = moment(message.time).locale('zh-cn').calendar()
      return message
    })
  } else {
    messages = []
  }


  if (orders) {
    orders = orders.map(function (order) {
      order.time = moment(order.time).locale('zh-cn').calendar()
      return order
    })
  } else {
    orders = []
  }
 
  if (orders && orders.length > 0) {
    renderOrders(orders)
  }

  if (messages && messages.length > 0) {
    setTimeout(() => {
      let renderFrame = document.getElementById('renderFrame');
      renderFrame.contentWindow.postMessage({
        command: 'render',
        context: {
          name: 'messages',
          messages: messages
        }
      }, '*');
    }, 1200);
  }

  window.addEventListener('message', receiveMessage, false)

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
    switchPayMethod(to, target)
  })

  $(".showChangeLog").on("click", function () {
    localStorage.setItem('changelog_version', $("#changeLogs").data('version'))
    $("#changeLogs").show()
  })

  $("#openRecommendCard").on("click", function () {
    $("#recommendCardDialags").show()
  })

  $("#openWechatCard").on("click", function () {
    $("#wechatDialags").show()
  })

  $("#openjEventCard").on("click", function () {
    showJEvent()
  })

  $(".openMobliePage").on("click", function () {
    chrome.runtime.sendMessage({
      text: "openUrlAsMoblie",
      url: $(this).data('url')
    }, function (response) {
      console.log("Response: ", response);
    });
  })

  $("#loginState").on("click", function () {
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
  

  $(".reload").on("click", function () {
    var job_elem = $(this).parent().parent()

    if (job_elem) {
      chrome.runtime.sendMessage({
        text: "runJob",
        content: job_elem.attr('id')
      }, function(response) {
        console.log("Response: ", response);
      });
    }
  })

  $("#clearAccount").on("click", function () {
    localStorage.removeItem('jjb_account')
    localStorage.removeItem('jjb_orders')
    localStorage.removeItem('jjb_messages')
    chrome.tabs.create({
      url: "https://passport.jd.com/uc/login"
    })
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