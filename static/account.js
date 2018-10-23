import {getSetting} from './utils'

module.exports = {
  getLoginState: function () {
    let loginState = {
      pc: getSetting('jjb_login-state_pc', {
        state: "unknown"
      }),
      m: getSetting('jjb_login-state_m', {
        state: "unknown"
      }),
      class: "unknown"
    }
    // 处理登录状态
    if (loginState.m.state == 'alive' && loginState.pc.state == 'alive') {
      loginState.class = "alive"
    } else if (loginState.pc.state == 'failed' && loginState.pc.state == 'failed') {
      loginState.class = "failed"
    } else if (loginState.pc.state == 'failed' || loginState.pc.state == 'failed') {
      loginState.class = "warning"
    }
    return loginState
  }
}