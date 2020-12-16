const { MpPlatform } = require('@mpkit/types');
const { parseMpXml } = require('./dist/index.cjs.js');
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
const res1 = parseMpXml(`<block wx:elif="{{pageType==2}}">
<view class="navbar" style="height:{{navbarHeight}}rpx;" />
<view class="getUserInfo" style="top:{{navbarHeight}}rpx">
  <image src="{{icons.getUserInfoback}}" mode="widthFix" class="getUserInfoback" />
  <view class="getUserInfoBlock">
    <view class="getUserInfoBlockTitle">{{navTitle}}</view>
    <image class="getUserInfoBlockHead" src="{{tool.compressionPic(liveRoomHeadUrl,3)}}" webp="{{true}}" />
    <view class="getUserInfoBlockName">{{liveRoomTitle}}</view>
    <view class="getUserInfoBlockCover">
      <image src="{{tool.compressionPic(titleImgUrl,1)}}" mode="aspectFill" webp="{{true}}" />
      <view class="getUserInfoBlockCoverS" />
      <view class="getUserInfoBlockCoverR">34124观看</view>
      <view class="getUserInfoBlockCoverL">● 直播中</view>
      <image class="getUserInfoBlockPlay" src="{{icons.getUserInfoPlay}}" />
    </view>
  </view>
  <view class="getUserInfoBtn">微信登录观看直播</view>
  <image class="getUserInfoLogo" src="{{icons.getUserInfoLogo}}" />
  <button open-type="getUserInfo"  bindgetuserinfo='getUserInfoBtn' hover-class="none" />
</view>
</block>`, MpPlatform.wechat);
console.log(res1);