const { parseXML } = require('./dist/index.cjs.js');
const json = parseXML(`<span>123</span><import />
<!-- abc -->
<block wx:if="{{pageType==1}}" name="true"></block>
{{a}}
  <view class="navbar" style="height:{{navbarHeight}}rpx;"></view>
  <view class="emptyContent" style="top:{{navbarHeight}}rpx">
    <image class="emptyBackImg" src="{{icons.live_empty}}"></image>
    <view class="emptyWord">哎呀，直播找不到啦~</view>
    <view class="emptyBtn" catchtap="gotoHome">更多直播</view>
  </view>
</block>
<button>123</button>
`);
console.log(JSON.stringify(json));