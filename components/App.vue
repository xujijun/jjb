<template>
  <div>
    <div class="settings">
      <div class="weui-tab">
        <div :class="`${scienceOnline} weui-navbar`">
          <div class="weui-navbar__item weui-bar__item_on" data-type="frequency_settings">任务设置</div>
          <div class="weui-navbar__item" data-type="notice_settings">通知设置</div>
          <div class="weui-navbar__item" data-type="other_settings">高级设置</div>
        </div>
        <div class="weui-tab__panel">
          <form
            id="settings"
            data-persist="garlic"
            data-domain="true"
            data-destroy="false"
            method="POST"
          >
            <div class="frequency_settings settings_box">
              <div class="weui-cells weui-cells_form">
                <div
                  class="weui-cell weui-cell_select weui-cell_select-after"
                  v-for="task in taskList"
                  :key="task.id"
                >
                  <div class="weui-cell__bd job-m">
                    <span :title="task.description" v-tippy>
                      <a
                        v-if="task.platform == 'm'"
                        class="openMobilePage"
                        :data-url="task.url"
                      >{{task.title}}</a>
                      <a v-else :href="task.url" target="_blank">{{task.title}}</a>
                    </span>
                    <span v-show="task.suspended && !task.checked" v-tippy title="因账号未登录任务已暂停运行">
                      <i class="job-state weui-icon-waiting-circle" @click="showLoginState"></i>
                    </span>
                    <i
                      v-show="task.checked"
                      v-tippy
                      :title="task.checkin_description"
                      class="today weui-icon-success-circle"
                    ></i>
                    <i
                      v-show="!task.checked && !task.suspended"
                      @click="retryTask(task)"
                      class="reload-icon"
                      v-tippy
                      :title="task.last_run_description"
                    ></i>
                  </div>
                  <div class="weui-cell__bd">
                    <select class="weui-select" v-auto-save :name="`job${task.id}_frequency`">
                      <option
                        v-for="option in task.frequencyOption"
                        :value="option"
                        :key="option"
                      >{{ frequencyOptionText[option] }}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="tips bottom-tips">
                <p class="page__desc">
                  <a id="notice">京东页面经常更新，唯有你的支持才能让京价保保持更新。</a>
                  <a
                    href="#"
                    class="weui-btn weui-btn_mini weui-btn_primary"
                    data-to="weixin"
                    data-target="ming"
                  >打赏</a>
                </p>
              </div>
            </div>
            <div class="notice_settings settings_box" style="display: none">
              <div class="weui-cells weui-cells_form">
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">不再提示签到通知</div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" v-auto-save type="checkbox" name="mute_checkin">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">不再提示领券通知</div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" v-auto-save type="checkbox" name="mute_coupon">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">隐藏价保商品信息</div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="hide_good">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="开启后不再晚上12点至凌晨6点发送浏览器通知"
                    >开启夜晚防打扰</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="mute_night">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span>
                      播放提示音效
                      <i
                        id="listen"
                        class="weui-icon-info-circle tippy"
                        data-tippy-content="试听全部提示音效"
                      ></i>
                    </span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="play_audio">
                  </div>
                </div>
              </div>
              <div class="other_actions">
                <div class="recommendation">
                  <h3 style="text-align: center;color: #666;">服务推荐</h3>
                  <p class="recommendServices">
                    <span
                      :class="service.class"
                      v-for="service in recommendServices"
                      :key="service.title"
                    >
                      <a
                        target="_blank"
                        v-tippy
                        :title="service.description"
                        :href="service.link"
                      >{{service.title}}</a>
                    </span>
                  </p>
                  <div class="recommendedLink">
                    <p v-for="link in recommendedLinks" :key="link.title">
                      <a
                        v-if="link.mobile"
                        class="openMobilePage"
                        :style="link.style"
                        :data-url="link.url"
                      >{{link.title}}</a>
                      <a
                        v-else
                        :href="link.url"
                        :style="link.style"
                        class="weui-form-preview__btn weui-form-preview__btn_primary"
                        target="_blank"
                      >{{link.title}}</a>
                    </p>
                  </div>
                </div>
                <h3 style="text-align: center;color: #666;">关注京价保</h3>
                <p style="text-align: center;margin-top: -10px;">
                  <a
                    href="https://t.me/jingjiabao"
                    class="weui-btn weui-btn_mini weui-btn_plain-default tippy"
                    data-tippy-placement="top-start"
                    data-tippy-content="通过电报群接收京价保的最新消息"
                    target="_blank"
                  >京价保@Telegram</a>
                  <a
                    href="#"
                    id="openWechatCard"
                    class="weui-btn weui-btn_mini weui-btn_plain-default tippy"
                    data-tippy-placement="top-start"
                    data-tippy-content="关注京价保的公众号"
                  >京价保公众号</a>
                </p>
              </div>
            </div>
            <div class="other_settings settings_box" style="display: none">
              <div class="weui-cells weui-cells_form">
                <div class="weui-cell weui-cell_select weui-cell_select-after">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="京东价格保护的时间不同商品不同，大部分商品是7天价保"
                    >监控订单范围</span>
                  </div>
                  <div class="weui-cell__bd">
                    <select class="weui-select" v-auto-save name="price_pro_days">
                      <option value="7">最近7天</option>
                      <option value="15">最近15天</option>
                      <option value="30">最近30天</option>
                    </select>
                  </div>
                </div>
                <div class="weui-cell weui-cell_select weui-cell_select-after">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="商品降价小于“最小价差”时将不会自动申请价保"
                    >最小价差</span>
                  </div>
                  <div class="weui-cell__bd">
                    <select class="weui-select" v-auto-save name="price_pro_min">
                      <option value="0.1">0.1元</option>
                      <option value="0.5">0.5元</option>
                      <option value="1">1元</option>
                      <option value="5">5元</option>
                    </select>
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="如果您是Plus会员，在价保时会选择使用Plus价格来做对比"
                    >我是Plus会员</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="is_plus">
                  </div>
                </div>
                <!-- @if Browser='chrome' -->
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="开启剁手保护模式后，每次购物时京价保将向你发起灵魂质问，帮你极致省钱"
                    >剁手保护模式</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="hand_protection">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="京东热卖是带有推荐的链接落地页，开启本选项后将自动为你把该页面跳转到商品页"
                    >自动跳转热卖页</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="auto_gobuy">
                  </div>
                </div>
                <!-- @endif -->

                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="开启本选项后，发现商品降价有价保机会时，京价保只会发送浏览器提醒，而不会自动提交价保申请（不推荐开启此选项）"
                    >被动价保模式</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input
                      class="weui-switch"
                      type="checkbox"
                      v-auto-save="{ notice: '开启本选项后，发现商品降价有价保机会时，京价保只会发送浏览器提醒，而不会自动提交价保申请' }"
                      name="prompt_only"
                    >
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      v-tippy
                      title="在右侧“最近订单”中京价保提供的商品链接包含了京东联盟的跳转，它不会影响你，却能给开发者提供一些收入，帮助京价保保持更新。"
                    >停用最近订单的链接</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input
                      class="weui-switch"
                      type="checkbox"
                      v-on:change="updateDisableOrderLink"
                      v-auto-save="{
                        notice: '京价保展示的最近订单商品链接带有京东联盟的返利，使用该链接购买能给开发者提供一些收入，帮助京价保保持更新。确认要停用该链接吗？'
                      }"
                      name="disabled_link"
                    >
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="该功能会自动跳转http的访问至https，这能更安全的访问京东以及防止运营商劫持（而且这样你就不会把劫持跳转的锅甩到京价保身上了）。"
                    >强制https访问京东</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input class="weui-switch" type="checkbox" v-auto-save name="force_https">
                  </div>
                </div>
                <div class="weui-cell weui-cell_switch">
                  <div class="weui-cell__bd">
                    <span
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="停用价格走势功能将停止上报京价保在本地获取到的商品价格同时停止展示价格走势图"
                    >停用价格走势图</span>
                  </div>
                  <div class="weui-cell__ft">
                    <input
                      class="weui-switch"
                      type="checkbox"
                      v-auto-save="{ notice: '停用价格走势功能将停止上报京价保在本地获取到的商品价格，同时也会停止展示价格走势图' }"
                      name="disable_pricechart"
                    >
                  </div>
                </div>
              </div>
              <div class="other_actions">
                <p class="help_btns" style="text-align: center;">
                  <span class="el-tag el-tag--success">
                    <a
                      href="#"
                      id="openFeedback"
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="向作者提供功能建议或京东活动的地址，帮助京价保及时更新"
                    >建议反馈</a>
                  </span>
                  <span class="el-tag el-tag--warning">
                    <a
                      href="https://blog.jjb.im/faq.html"
                      target="_blank"
                      data-tippy-placement="top-start"
                      class="tippy"
                      data-tippy-content="了解一些常见问题的解答"
                    >常见问题</a>
                  </span>
                </p>
                <p style="text-align: center;">
                  <a
                    href="#"
                    id="clearAccount"
                    class="weui-btn weui-btn_mini weui-btn_plain-default tippy"
                    data-tippy-placement="top-start"
                    data-tippy-content="在登录时勾选记住密码可保存新的密码"
                  >清除账号密码和记录</a>
                </p>
              </div>
              <p
                class="text-tips version showChangelog tippy"
                @click="showChangelog"
                data-tippy-content="点击查看版本更新记录"
              >
                当前版本：{{currentVersion}}
                <span class="weui-badge weui-badge_dot" v-if="newChangelog"></span>
                <span class="weui-badge new-version" v-if="newVersion">有新版</span>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div class="bottom-box">
        <div class="avatar">
          <a
            id="loginState"
            :class="`${loginState.class} login-state showLoginState`"
            v-tippy
            :title="loginStateDescription"
          ></a>
        </div>
        <div class="links">
          <span class="el-tag el-tag--success">
            <a
              href="#"
              class="switch-paymethod tippy"
              data-tippy-placement="top-start"
              data-tippy-content="打赏开发者"
              data-to="
              wechat"
              data-target="ming"
            >打赏开发者</a>
          </span>
          <span class="el-tag el-tag--danger">
            <a
              href="#"
              class="switch-paymethod"
              title="天天领支付宝红包"
              v-tippy
              data-to="alipay"
              data-target="redpack"
            >支付宝红包</a>
          </span>
          <span class="el-tag el-tag--warning">
            <a
              href="#"
              id="openjEventCard"
              data-tippy-placement="top-start"
              class="tippy"
              data-tippy-content="热门的促销活动推荐"
            >活动推荐</a>
          </span>
          <span class="el-tag">
            <a
              data-tippy-placement="top-start"
              class="tippy"
              data-tippy-content="PLUS会员每个月可以领取总额100元的全品类券，但是领取后24小时就会失效，因此推荐每次购物前领取"
              href="https://plus.jd.com/coupon/index"
              target="_blank"
            >领PLUS券</a>
          </span>
        </div>
      </div>
    </div>
    <div class="contents">
      <div class="weui-tab">
        <div class="weui-navbar">
          <div class="weui-navbar__item weui-bar__item_on" data-type="orders">
            最近订单
            <a
              href="https://order.jd.com/center/list.action"
              target="_blank"
              data-tippy-placement="top-start"
              class="tippy"
              data-tippy-content="打开京东订单列表"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                style="margin-bottom: -1px"
              >
                <path fill="#fff" stroke="#888" d="M1.5 4.518h5.982V10.5H1.5z"></path>
                <path
                  d="M5.765 1H11v5.39L9.427 7.937l-1.31-1.31L5.393 9.35l-2.69-2.688 2.81-2.808L4.2 2.544z"
                  fill="#888"
                ></path>
                <path
                  d="M9.995 2.004l.022 4.885L8.2 5.07 5.32 7.95 4.09 6.723l2.882-2.88-1.85-1.852z"
                  fill="#fff"
                ></path>
              </svg>
            </a>
          </div>
          <div class="weui-navbar__item" data-type="messages">
            最近通知
            <span id="unreadCount" class="weui-badge">0</span>
          </div>
          <div class="weui-navbar__item zaoshu-tab" data-type="discounts" @click="readDiscounts">
            <img src="../static/image/zaoshu.png" alt="" class="zaoshu-icon">
            枣树集惠
            <span
              class="weui-badge weui-badge_dot new-discounts"
              v-if="newDiscounts"
            ></span>
          </div>
        </div>
        <div class="weui-tab__panel">
          <div id="orders" class="weui-cells contents-box orders">
            <div class="orders" v-if="orders && orders.length > 0">
              <li
                v-for="order in orders"
                :key="order.id"
                v-show="(order.promotionInfo && hiddenPromotionIds.indexOf(order.id) < 0) || (order.goods && order.goods.length > 0)"
              >
                <div class="order_time">
                  <span v-show="order.displayTime">下单时间： {{order.displayTime}}</span>
                  <span v-show="order.promotionInfo">{{order.promotionInfo}}</span>
                  <span
                    v-if="order.promotionInfo"
                    v-tippy
                    title="不感兴趣"
                    class="dismiss"
                    @click="dismiss(order)"
                  >&times;</span>
                  <span
                    v-else
                    v-show="order.id"
                    v-tippy
                    :title="hiddenOrderIds.indexOf(order.id) > -1 ? '显示订单' : '隐藏订单'"
                    :class="hiddenOrderIds.indexOf(order.id) > -1 ? 'show-order' : 'hide-order'"
                    @click="toggleOrder(order)"
                  ></span>
                </div>
                <div class="weui-cell promotion" v-if="order.promotionInfo">
                  <div class="weui-cell__bd">
                    <div class="good_title">
                      <img
                        v-if="order.img"
                        :src="`https:${order.img}`"
                        @error.once="backup_picture($event)"
                        class="promotion_title backup_picture"
                        :alt="order.title"
                      >
                      <a :href="`${order.link}`" target="_blank">{{order.title}}</a>
                      <p class="description">{{order.description}}</p>
                    </div>
                  </div>
                  <div class="weui-cell__ft">
                    <span class="promotion_price">{{order.priceInfo}}</span>
                    <a
                      :href="`${order.link}`"
                      target="_blank"
                      class="buy-btn weui-btn weui-btn_mini weui-btn_primary"
                    >{{order.buttonText}}</a>
                  </div>
                </div>
                <div
                  v-for="(good, index) in order.goods"
                  :key="index"
                  :class="`order-good ${good.suspended}`"
                  v-show="hiddenOrderIds.indexOf(order.id) > -1 ? false : true"
                >
                  <div class="weui-cell good" v-if="good && good.order_price > 0">
                    <div class="weui-cell__bd">
                      <div class="good_title">
                        <div class="good_img">
                          <img
                            v-if="good.img"
                            :src="`https:${good.img}`"
                            @error.once="backup_picture($event)"
                            class="backup_picture"
                            :alt="good.name"
                          >
                          <div class="monitoring">
                            <span v-if="good.suspended" @click="toggleSuspend(order, good, index)" class="resume" v-tippy title="恢复价保"></span>
                            <span v-else class="suspend" @click="toggleSuspend(order, good, index)" v-tippy title="停止价保"></span>
                          </div>
                        </div>
                        <p v-if="good.sku">
                          <a v-if="!disableOrderLink" :href="`https://jjb.zaoshu.so/good/${good.sku}`" target="_blank"> {{good.name}}</a>
                          <a v-else>{{good.name}}</a>
                          <span
                            class="count"
                            v-if="good.quantity"
                          >&times; {{good.quantity}}</span>
                        </p>
                      </div>
                    </div>
                    <div class="weui-cell__ft">
                      <span class="order_price">￥{{good.order_price}}</span>
                      <div class="sku_price" v-if="skuPriceList[good.sku]">
                        <span
                          class="new_price down"
                          v-if="good.order_price > skuPriceList[good.sku].price"
                        >￥{{skuPriceList[good.sku].price}}</span>
                        <span
                          class="new_price up"
                          v-else-if="good.order_price < skuPriceList[good.sku].price"
                        >￥{{skuPriceList[good.sku].price}}</span>
                        <span class="new_price" v-else>￥{{skuPriceList[good.sku].price}}</span>
                      </div>
                    </div>
                  </div>
                  <p class="success_log" v-for="(log, index) in good.success_log" :key="index">{{log}}</p>
                </div>
              </li>
              <p class="text-tips">
                <a
                  href="https://blog.jjb.im/price-protection-policy.html"
                  target="_block"
                  v-tippy
                  title="点击了解京东价格保护政策"
                >只显示在价保监控范围内且下单金额大于0的订单（默认15天内）</a>
              </p>
            </div>
            <div class="no_order" v-else>
              <div v-if="loadingOrder">
                <h4>正在加载最近订单</h4>
              </div>
              <div v-else>
                <h4>暂时还没有监控到订单</h4>
                <p class="tips">只显示选定范围的订单(默认为最近7天)</p>
              </div>
            </div>
          </div>
          <div id="messages" class="weui-cells contents-box messages">
            <div class="messages-top">
              <div class="messages-header">
                <button
                  :class="[selectedTab == 'checkin_notice' ? 'selectedTab' : '', 'Button', 'messages-tab', 'Button--plain', 'tippy']"
                  data-tippy-content="签到记录"
                  data-type="checkin_notice"
                  type="button"
                  @click="selectType('checkin_notice')"
                >
                  <span class="checkin"></span>
                </button>
                <button
                  :class="[selectedTab == 'notice' ? 'selectedTab' : '', 'Button', 'messages-tab', 'Button--plain', 'tippy']"
                  data-tippy-content="价保记录"
                  data-type="notice"
                  type="button"
                  @click="selectType('notice')"
                >
                  <span class="notice"></span>
                </button>
                <button
                  :class="[selectedTab == 'coupon' ? 'selectedTab' : '', 'Button', 'messages-tab', 'Button--plain', 'tippy']"
                  data-tippy-content="领券记录"
                  data-type="coupon"
                  type="button"
                  @click="selectType('coupon')"
                >
                  <span class="coupon"></span>
                </button>
              </div>
            </div>
            <div class="message-items" v-if="messages && messages.length > 0">
              <li v-for="(message, index) in messages" :key="index">
                <div
                  :class="`weui-panel__bd message-item type-${message.type}`"
                  v-show="!selectedTab || selectedTab == message.type"
                >
                  <div class="weui-media-box weui-media-box_text">
                    <h4 class="weui-media-box__title message">
                      <i :class="`${message.type} ${message.batch}`"></i>
                      {{message.title}}
                    </h4>
                    <div class="coupon-box" v-if="message.coupon">
                      <p>
                        <span class="price">{{message.coupon.price}}</span>
                      </p>
                      <a
                        v-if="message.coupon.batch == 'baitiao'"
                        href="https://vip.jr.jd.com/coupon/myCoupons?default=IOU"
                        target="_blank"
                      >{{message.coupon.name}}</a>
                      <a
                        v-else-if="message.coupon.batch"
                        :href="`https://search.jd.com/Search?coupon_batch=${message.coupon.batch}`"
                        target="_blank"
                      >{{message.coupon.name}}</a>
                      <a
                        v-else
                        href="https://jjb.zaoshu.so/event/jdc?e=0&p=AyIPZRprFDJWWA1FBCVbV0IUWVALHFRBEwQAQB1AWQkrW1N8UGM3WyZ1VmxSCHMIE1dEbytsKxkOfARUG1IJAhMbVR5KFQsZBFUQWhAyEQ5UH10XARcFZRhYFAQRN2UbWiVJfAZlG1sdBhEBXR5dFDISA1cTXxUBFwBQG1McMhU3F18ES1kiN2UrayUCEjdVKwRRX08%3D&t=W1dCFFlQCxxUQRMEAEAdQFkJ"
                        target="_blank"
                      >{{message.coupon.name}}</a>
                    </div>
                    <p v-else class="weui-media-box__desc">{{message.content}}</p>
                    <ul class="weui-media-box__info">
                      <li class="weui-media-box__info__meta">时间: {{message.time}}</li>
                    </ul>
                  </div>
                </div>
              </li>
            </div>
            <div class="no_message" v-else>暂时还没有未读消息</div>
          </div>
          <discounts/>
        </div>
      </div>
      <div class="bottom">
        <div class="weui-tabbar">
          <a id="pricePro" class="weui-tabbar__item" v-tippy title="打开京东价格保护页面">
            <img src="../static/image/money.png" alt="" class="weui-tabbar__icon">
            <p class="weui-tabbar__label">价保页面</p>
          </a>
          <a
            class="showChangelog weui-tabbar__item"
            @click="showChangelog"
            v-tippy
            title="查看京价保最近更新记录"
            style="position: relative;"
          >
            <img src="../static/image/update.png" alt="" class="weui-tabbar__icon">
            <p class="weui-tabbar__label">
              最近更新
              <span
                class="weui-badge weui-badge_dot"
                style="position: absolute;top: 0;right: 4em;"
                v-if="newChangelog"
              ></span>
              <span
                class="weui-badge"
                style="position: absolute;top: -.4em;right: 2em;"
                v-if="newVersion"
              >有新版</span>
            </p>
          </a>
          <a
            id="openGithub"
            class="weui-tabbar__item"
            href="https://github.com/sunoj/jjb"
            v-tippy
            title="点击查看本插件的全部代码"
            target="_blank"
          >
            <img src="../static/image/github.png" alt="" class="weui-tabbar__icon">
            <p class="weui-tabbar__label">源代码</p>
          </a>
        </div>
      </div>
    </div>
    <login-notice :state="loginState"/>
  </div>
</template>

<script>
import * as _ from "lodash";
import tippy from "tippy.js";
import weui from "weui.js";
import Vue from "vue";

import { DateTime } from 'luxon'
import { getLoginState } from '../static/account'
import { tasks, frequencyOptionText, findJobPlatform } from "../static/tasks";
import { getSetting, versionCompare, readableTime } from "../static/utils";
import { rewards, notices, stateText, recommendServices } from "../static/variables";

function tippyElement(el) {
  setTimeout(() => {
    let title = el.getAttribute("title");
    if (title) {
      if (el._tippy) {
        el._tippy.setContent(title)
      } else {
        tippy(el, {
          content: title
        });
      }
    }
  }, 50);
}

Vue.directive("tippy", {
  componentUpdated: tippyElement,
  inserted: tippyElement
});

Vue.directive("autoSave", {
  bind(el, binding, vnode) {
    function revertValue(el) {
      let current = getSetting(el.name, null);
      if (el.type == "checkbox") {
        if (current == "checked") {
          el.checked = true;
        } else {
          el.checked = false;
        }
      } else if (el.type == "select-one") {
        el.value = current || el.options[0].value;
      } else {
        el.value = current;
      }
    }
    function saveToLocalStorage(el, binding) {
      if (el.type == "checkbox") {
        if (el.checked) {
          localStorage.setItem(el.name, "checked");
        } else {
          localStorage.removeItem(el.name);
        }
      } else {
        localStorage.setItem(el.name, el.value);
      }
      weui.toast("设置已保存", 500);
    }
    revertValue(el);
    el.addEventListener("change", function(event) {
      if (binding.value && binding.value.notice && el.checked) {
        weui.confirm(
          binding.value.notice,
          function() {
            saveToLocalStorage(el, binding);
          },
          function() {
            event.preventDefault();
            setTimeout(() => {
              revertValue(el);
            }, 50);
          },
          {
            title: "选项确认"
          }
        );
      } else {
        saveToLocalStorage(el, binding);
      }
    });
  }
});

import laodingMask from './laoding-mask.vue';
import loginNotice from './login-notice.vue';
import discounts from './discounts.vue';

export default {
  name: "App",
  components: { laodingMask, loginNotice, discounts },
  data() {
    return {
      taskList: [],
      messages: [],
      orders: [],
      skuPriceList: {},
      recommendedLinks: getSetting("recommendedLinks", []),
      stateText: stateText,
      newDiscounts: false,
      loadingOrder: false,
      scienceOnline: false,
      frequencyOptionText: frequencyOptionText,
      currentVersion: "{{version}}",
      recommendServices: getSetting("recommendServices", recommendServices),
      disableOrderLink: getSetting("disabled_link") == "checked" ? true : false,
      newChangelog: versionCompare(getSetting("changelog_version", "2.0"), "{{version}}") < 0,
      hiddenOrderIds: getSetting("hiddenOrderIds", []),
      hiddenPromotionIds: getSetting("hiddenPromotionIds", []),
      selectedTab: null,
      loginStateDescription: "未能获取登录状态",
      newVersion: getSetting("newVersion", null),
      loginState: {
        default: true,
        m: {
          state: "unknown"
        },
        pc: {
          state: "unknown"
        }
      }
    };
  },
  mounted: async function() {
    // 准备数据
    this.getTaskList();
    // 渲染订单
    setTimeout(() => {
      this.getOrders()
    }, 50);
    // 查询最新优惠
    setTimeout(() => {
      this.getLastDiscount()
    }, 100);
    // 测试是否科学上网
    setTimeout(() => {
      this.tryGoogle()
    }, 200);
    // 渲染通知
    setTimeout(() => {
      this.getMessages()
    }, 500);
    this.dealWithLoginState()

    // 接收消息
    chrome.runtime.onMessage.addListener((
      message,
      sender,
      sendResponse
    ) => {
      switch (message.action) {
        case "orders_updated":
          let orders = JSON.parse(message.data).map(function(order) {
            order.displayTime = readableTime(DateTime.fromISO(order.time));
            return order;
          });
          this.orders = orders;
          break;
        case "new_message":
          let lastUnreadCount = $("#unreadCount").text();
          $("#unreadCount")
            .text(Number(lastUnreadCount) + 1)
            .fadeIn();
          this.messages = makeupMessages(JSON.parse(message.data));
          break;
        case "loginState_updated":
          this.dealWithLoginState();
          setTimeout(() => {
            this.getTaskList();
          }, 1000);
          break;
        default:
          break;
      }
    });
  },
  watch: {
    loginState: function(newState, oldState) {
      if (
        oldState.m.state != "alive" &&
        oldState.pc.state != "alive" &&
        !oldState.default
      ) {
        if (newState.m.state == "alive" || newState.pc.state == "alive") {
          if (this.orders.length < 1) {
            this.loadingOrder = true;
            this.retryTask(tasks[0], true);
          }
        }
      }
    }
  },
  methods: {
    getLastDiscount: async function() {
      let response = await fetch("https://jjb.zaoshu.so/discount/last");
      let lastDiscount = await response.json();
      let readDiscountAt = localStorage.getItem("readDiscountAt");
      if (
        !readDiscountAt ||
        new Date(lastDiscount.createdAt) > new Date(readDiscountAt)
      ) {
        this.newDiscounts = true;
      }
    },
    tryGoogle: async function() {
      let response = await fetch("https://www.googleapis.com/discovery/v1/apis?name=abusiveexperiencereport");
      if ( response.status == "200" ) {
        this.scienceOnline = true;
      } else {
        this.scienceOnline = false;
      }
    },
    updateDisableOrderLink: function() {
      setTimeout(() => {
        this.disableOrderLink = getSetting("disabled_link") == "checked" ? true : false
      }, 1000);
    },
    makeupMessages: function(messages) {
      if (messages) {
        return messages.reverse().map(function(message) {
          if (message.type == "coupon") {
            message.coupon = JSON.parse(message.content);
          }
          message.time = readableTime(DateTime.fromISO(message.time));
          return message;
        });
      } else {
        return [];
      }
    },
    readDiscounts: function() {
      this.newDiscounts = false
    },
    getPromotions: function() {
      let promotions = getSetting("promotions", []);
      promotions = _.reject(promotions, promotion => {
        return (
          DateTime.fromJSDate(new Date(promotion.validDate)) < DateTime.local()
        );
      });
      localStorage.setItem("promotions", JSON.stringify(promotions));
      return promotions;
    },
    getOrders: function() {
      let orders = JSON.parse(localStorage.getItem("jjb_orders"));
      let skuPriceList = getSetting("skuPriceList", {});
      let suspendedApplyIds = getSetting("suspendedApplyIds", []);
      if (orders) {
        orders = orders.map(function(order) {
          order.displayTime = readableTime(DateTime.fromISO(order.time));
          order.goods = order.goods.map(function(good, index) {
            good.suspended = _.indexOf(suspendedApplyIds, `applyBT_${order.id}_${good.sku}_${index+1}`) > -1 ? "suspended" : false
            return good
          })
          return order;
        });
      } else {
        orders = [];
      }
      let promotions = this.getPromotions();
      orders.splice(1, 0, ...promotions);
      this.orders = orders;
      this.skuPriceList = skuPriceList;
    },
    // 处理登录状态
    dealWithLoginState: function() {
      function getStateDescription(loginState, type) {
        return (
          stateText[loginState[type].state] +
          (loginState[type].message
            ? `（ ${loginState[type].message} 上次检查： ${readableTime(
                DateTime.fromISO(loginState[type].time)
              )} ）`
            : "")
        );
      }

      let loginState = getLoginState();
      this.loginState = loginState;

      this.loginState["pc"].description = "当前登录状态" + getStateDescription(loginState, "pc");
      this.loginState["m"].description = "当前登录状态" + getStateDescription(loginState, "m");
      this.loginStateDescription = "PC网页版登录" + getStateDescription(loginState, 'pc') + "，移动网页版登录" + getStateDescription(loginState, 'm')
    },
    // 任务列表
    getTaskList: async function() {
      this.taskList = _.map(tasks, task => {
        task.last_run_at = getSetting("job" + task.id + "_lasttime", null);
        task.frequencySetting = getSetting(
          "job" + task.id + "_frequency",
          task.frequency
        );
        task.last_run_description = task.last_run_at
          ? "上次运行： " +
            readableTime(DateTime.fromMillis(Number(task.last_run_at)))
          : "从未执行";
        // 如果是签到任务，则读取签到状态
        if (task.checkin) {
          let checkinRecord = getSetting("jjb_checkin_" + task.key, null);
          if (
            checkinRecord &&
            checkinRecord.date == DateTime.local().toFormat("o")
          ) {
            task.checked = true;
            task.checkin_description =
              "完成于：" +
              readableTime(DateTime.fromISO(checkinRecord.time)) +
              (checkinRecord.value ? "，领到：" + checkinRecord.value : "");
          }
        }
        // 选择运行平台
        task.platform = findJobPlatform(task);
        if (!task.url) {
          task.url = task.platform
            ? task.src[task.platform]
            : task.src[task.type[0]];
        }
        if (!task.platform) {
          task.suspended = true;
          task.platform = task.type[0];
        }
        return task;
      });
    },
    getMessages: function() {
      let messages = JSON.parse(localStorage.getItem("jjb_messages"));
      messages = this.makeupMessages(messages);
      this.messages = messages;
    },
    showLoginState: function() {
      $("#loginNotice").show();
    },
    retryTask: function(task, hideNotice = false) {
      chrome.runtime.sendMessage(
        {
          action: "runTask",
          hideNotice: hideNotice,
          taskId: task.id
        },
        function(response) {
          if (!hideNotice) {
            weui.toast("手动运行成功", 3000);
          }
        }
      );
    },
    selectType: function(type) {
      this.selectedTab = type;
    },
    dismiss: function(order) {
      this.hiddenPromotionIds.push(order.id);
      localStorage.setItem(
        "hiddenPromotionIds",
        JSON.stringify(this.hiddenPromotionIds)
      );
      this.$forceUpdate();
    },
    toggleOrder: function(order) {
      if (_.indexOf(this.hiddenOrderIds, order.id) > -1) {
        this.hiddenOrderIds = _.pull(this.hiddenOrderIds, order.id);
      } else {
        this.hiddenOrderIds.push(order.id);
      }
      localStorage.setItem(
        "hiddenOrderIds",
        JSON.stringify(this.hiddenOrderIds)
      );
      this.$forceUpdate();
    },
    toggleSuspend: function (order, good, index) {
      // localStorage.setItem(`order_${order.id}_index_${index}`, 'suspended')
      let suspendedApplyIds = getSetting("suspendedApplyIds", []);
      let applyId = `applyBT_${order.id}_${good.sku}_${index+1}`
      if (_.indexOf(suspendedApplyIds, applyId) > -1) {
        suspendedApplyIds = _.pull(suspendedApplyIds, applyId);
        good.suspended = false
      } else {
        suspendedApplyIds.push(applyId);
        good.suspended = "suspended"
      }
      localStorage.setItem(
        "suspendedApplyIds",
        JSON.stringify(suspendedApplyIds)
      );
    },
    showChangelog: function() {
      this.newChangelog = false;
      localStorage.setItem("changelog_version", this.currentVersion);
      weui.dialog({
        title: "更新记录",
        content: `
          <iframe id="changelogIframe" frameborder="0" src="https://jjb.zaoshu.so/changelog?buildId={{buildid}}&browser={{browser}}" style="width: 100%;min-height: 350px;"
          ></iframe>
        `,
        className: "changelog",
        buttons: [
          {
            label: "完成",
            type: "primary"
          }
        ]
      });
    }
  }
};
</script>

<style scoped>
.order-good.suspended{
  opacity: 0.5
}
.weui-navbar.true .weui-navbar__item.weui-bar__item_on{
  background-image: linear-gradient(180deg,#09bb07,#06a90c94);
}
</style>