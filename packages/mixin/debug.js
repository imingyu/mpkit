const { mergeApi, mergeView, MixinStore, MkApp, promiseifyApi } = require('./dist/index.cjs.js');
// const appSpec = MkApp({
//     globalData: {
//         user: {
//             name: 'Tom'
//         }
//     },
//     onShow() {
//         console.log('onShow1')
//     }
// }, {
//     globalData: {
//         user: {
//             name: 'Alice',
//             age: 20
//         }
//     },
//     onShow() {
//         console.log('onShow2')
//     }
// });
// console.log(appSpec);


const state = {}
const mockApi = {
    name: 'Tom',
    method1Sync(a) {
        state.method1 = true;
        return a;
    },
    method2(a) {
        setTimeout(() => {
            a && a.fail({
                errMsg: 'test'
            });
        })
    },
    method3(a) {
        state.method3 = true;
        setTimeout(() => {
            a && a.success();
        })
    }
}
// promiseifyApi(mockApi, 'method1Sync', 3).then(res => {
//     assert.equal(res, 3);
//     check('t1');
// });
// promiseifyApi(mockApi, 'method3', {
//     success() {
//     }
// }).then(res => {
//     assert.equal(res, undefined);
//     assert.equal(state.method3, true);
//     check('t2');
// });
promiseifyApi(mockApi, 'method2', {
    success() {
        assert.equal(true, false);
    },
    fail() {
    }
}).then(res => {
    assert.equal(true, false);
}).catch(err => {
    assert.equal(err.message, 'test');
    check('t3');
})