const { MpPlatform } = require('@mpkit/types');
const { parseMpXml, mpXmlParseResultToJSON } = require('./dist/index.cjs.js');
// const json = parseMpXml(`<span>123</span><import name="tom"></import>
// <!-- abc -->
// <block wx:if="{{pageType==1}}" name="true"></block>
// {{a}}
//   <view class="navbar" style="height:{{navbarHeight}}rpx;"></view>
//   <view class="emptyContent" style="top:{{navbarHeight}}rpx">
//     <image class="emptyBackImg" src="{{icons.live_empty}}"></image>
//     <view class="emptyWord">哎呀，直播找不到啦~</view>
//     <view class="emptyBtn" catchtap="gotoHome">更多直播</view>
//   </view>
// </block>
// <button>123</button>
// `, MpPlatform.wechat);
// console.log(JSON.stringify(json));
// const xml = `<view>123<text>456</text>`;
// const res = parseMpXml(xml, MpPlatform.wechat);
const res1 = parseMpXml(`<view s-for="item,index in list"></view>`, MpPlatform.smart);
const res2 = mpXmlParseResultToJSON(res1, {
    xml: false,
    sourceLocationInfo: false
});
console.log(res1);