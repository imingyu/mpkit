const { mergeApi, mergeView, MixinStore, MkApp } = require('./dist/index.cjs.js');
const appSpec = MkApp({
    globalData: {
        user: {
            name: 'Tom'
        }
    },
    onShow() {
        console.log('onShow1')
    }
}, {
    globalData: {
        user: {
            name: 'Alice',
            age: 20
        }
    },
    onShow() {
        console.log('onShow2')
    }
});
console.log(appSpec);