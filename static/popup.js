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
    let disabled_link = getSetting('disabled_link');
    htmlRender({
      name: 'orders',
      orders: JSON.parse(message.data),
      disabled_link: disabled_link == 'checked' ? true : false
    })
  }
  if (message.action == 'new_message') {
    let lastUnreadCount = $("#unreadCount").text()
    $("#unreadCount").text(Number(lastUnreadCount) + 1).fadeIn()
    htmlRender({
      name: 'messages',
      messages: makeupMessages(JSON.parse(message.data))
    })
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

function htmlRender(data) {
  let renderFrame = document.getElementById('renderFrame');
  setTimeout(() => {
    renderFrame.contentWindow.postMessage({
      command: 'render',
      context: data
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
    switchAlipay(target)
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

// 对比版本
function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
      zeroExtend = options && options.zeroExtend,
      v1parts = v1.split('.'),
      v2parts = v2.split('.');

  function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
  }

  if (zeroExtend) {
      while (v1parts.length < v2parts.length) v1parts.push("0");
      while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) {
          return 1;
      }

      if (v1parts[i] == v2parts[i]) {
          continue;
      }
      else if (v1parts[i] > v2parts[i]) {
          return 1;
      }
      else {
          return -1;
      }
  }

  if (v1parts.length != v2parts.length) {
      return -1;
  }

  return 0;
}

function showJEvent() {
  // 加载反馈
  if ($("#jEventIframe").attr('src') == '') {
    $("#jEventIframe").attr('src', "https://jjb.zaoshu.so/recommend")
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
      $(".checkin-" + task).find('.reload').removeClass('show').hide()
      $(".checkin-" + task).find('.today').attr('title', title).addClass('show')
    }
  });
}


// 处理需要授权的任务
function dealRequestPermissionsJob() {
  $(".request-permissions").each((index, element) => {
    let job = $(element)
    let permissions = job.data('permissions')
    chrome.runtime.sendMessage({
      text: "checkPermissions",
      permissions: permissions
    },
    function (result) {
      if (result.granted) {
        job.find('.request-permissions-icon').hide()
      } else {
        job.find('.request-permissions-icon').show()
        job.find('select').val("never");
        localStorage.setItem(job.find('select').attr("name"), JSON.stringify("never"))
        job.find('select').prop("disabled", true)
      }
    });
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
    return stateText[loginState[type].state] + (loginState[type].message ? `（ ${loginState[type].message} 上次检查： ${moment(loginState[type].time).locale('zh-cn').calendar()} ）` : '')
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
      $('.frequency_settings .job-' + type + ' .reload').removeClass('show').hide()
      $('.frequency_settings .job-' + type + ' .job-state').addClass('show')

      if (loginUrl && type != 'm') {
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

function makeupMessages(messages) {
  if (messages) {
    return messages.reverse().map(function (message) {
      if (message.type == 'coupon') {
        message.coupon = JSON.parse(message.content)
      }
      message.time = moment(message.time).locale('zh-cn').calendar()
      return message
    })
  } else {
    return []
  }
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

  // 处理需要授权的任务
  dealRequestPermissionsJob()

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

  // 查询最新版本
  $.getJSON("https://jjb.zaoshu.so/updates/check?version={{version}}", function (json) {
    let skipVerison = localStorage.getItem('skipVerison')
    let localVerison = skipVerison || "{{version}}"
    if (versionCompare(localVerison, json.lastVerison) < 0 && json.notice) {
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
                url: json.url || "https://blog.jjb.im"
              })
            }
        }]
      });
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

  messages = makeupMessages(messages)

  if (orders) {
    orders = orders.map(function (order) {
      order.time = moment(order.time).locale('zh-cn').calendar()
      return order
    })
  } else {
    orders = []
  }
 
  if (orders && orders.length > 0) {
    let disabled_link = getSetting('disabled_link'); 
    htmlRender({
      name: 'orders',
      orders: orders,
      disabled_link: disabled_link == 'checked' ? true : false
    })
  }

  if (messages && messages.length > 0) {
    setTimeout(() => {
      htmlRender({
        name: 'messages',
        messages: messages
      });
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
  

  $(".reload").on("click", function () {
    var job_elem = $(this).parent().parent()
    if (job_elem) {
      chrome.runtime.sendMessage({
        text: "runJob",
        content: job_elem.attr('id')
      }, function(response) {
        weui.toast('手动运行成功', 3000);
        console.log("Response: ", response);
      });
    }
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