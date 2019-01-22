import {getLoginState} from './account'

module.exports = {
  priceProUrl: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
  frequencyOptionText: {
    '2h': "每2小时",
    '5h': "每5小时",
    'daily': "每天",
    'never': "从不"
  },
  mapFrequency: {
    '2h': 2 * 60,
    '5h': 5 * 60,
    'daily': 24 * 60,
    'never': 99999
  },
  tasks: [
    {
      id: '1',
      src: {
        m: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        pc: "https://pcsitepp-fm.jd.com/rest/pricepro/priceapply"
      },
      title: '价格保护',
      description: "价格保护默认只申请15天内下单的商品",
      mode: 'iframe',
      type: ['m', 'pc'],
      frequencyOption: ['2h', '5h', 'daily', 'never'],
      frequency: '5h'
    },
    {
      id: '15',
      src: {
        pc: 'https://jjb.zaoshu.so/event/coupon',
      },
      url: 'https://a.jd.com',
      title: '全品类券',
      description: "每天整天领取全平台通用券（105减5/500减20/1000减30）",
      schedule: [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
      mode: 'iframe',
      type: ['pc'],
      frequencyOption: ['2h', '5h', 'daily', 'never'],
      frequency: '2h'
    },
    {
      id: '3',
      src: {
        m: 'https://plus.m.jd.com/index',
      },
      title: 'PLUS券',
      description: "当然啦，你得先是PLUS会员才能领到",
      mode: 'iframe',
      frequencyOption: ['2h', '5h', 'daily', 'never'],
      type: ['m'],
      frequency: '5h'
    },
    {
      id: '4',
      src: {
        m: 'https://m.jr.jd.com/mjractivity/rn/couponCenter/index.html?RN=couponCenter&tab=20',
      },
      title: '白条券',
      mode: 'iframe',
      frequencyOption: ['2h', '5h', 'daily', 'never'],
      type: ['m'],
      frequency: '5h'
    },
    {
      id: '5',
      src: {
        m: 'https://vip.m.jd.com/page/signin',
      },
      title: '京东会员签到',
      description: "京东会员移动页每日签到领京豆",
      mode: 'iframe',
      key: "vip",
      type: ['m'],
      checkin: true,
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '14',
      src: {
        m: 'https://coin.jd.com/m/gb/index.html',
      },
      title: '钢镚每日签到',
      key: "coin",
      checkin: true,
      mode: 'iframe',
      type: ['m'],
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '6',
      src: {
        m: 'https://m.jr.jd.com/spe/qyy/main/index.html?userType=41',
      },
      title: '金融钢镚签到',
      description: "京东金融惠赚钱每日签到有钢镚奖励",
      key: "jr-qyy",
      mode: 'iframe',
      type: ['m'],
      checkin: true,
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '9',
      src: {
        m: 'https://m.jr.jd.com/vip/sign/html/index.html',
      },
      title: '金融会员签到',
      description: "京东金融会员签到，需要实名认证",
      key: "jr-index",
      checkin: true,
      mode: 'iframe',
      type: ['m'],
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '11',
      src: {
        m: 'https://bean.m.jd.com',
      },
      title: '每日京豆签到',
      key: "bean",
      checkin: true,
      mode: 'iframe',
      type: ['m'],
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '16',
      src: {
        m: 'https://m.jr.jd.com/btyingxiao/marketing/html/index.html',
      },
      title: '每日白条抽奖',
      description: "大部分情况获得京豆，也有可能白条券",
      key: "baitiao",
      checkin: true,
      mode: 'iframe',
      type: ['m'],
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '12',
      src: {
        m: 'https://ljd.m.jd.com/countersign/index.action',
      },
      title: '领取双签奖励',
      description: "完成京豆和京东金融签到有一个双签奖励",
      key: "double_check",
      mode: 'iframe',
      type: ['m'],
      checkin: true,
      frequencyOption: ['daily', 'never'],
      frequency: 'daily'
    },
    {
      id: '7',
      src: {
        pc: 'https://bean.jd.com/myJingBean/list',
      },
      title: '浏览店铺签到',
      description: "这个功能是自动浏览店铺签到得京豆，会开一些固定标签页",
      mode: 'tab',
      type: ['pc'],
      frequencyOption: ['daily', 'never'],
      frequency: 'never'
    },
  ],
  // 根据登录状态选择任务模式
  findJobPlatform: function (job) {
    let loginState = getLoginState()
    let platform = null
    for (var i = 0; i < job.type.length; i++) {
      if (loginState[job.type[i]].state == 'alive') {
        platform = job.type[i];
        break;
      }
    }
    return platform
  }
  
};