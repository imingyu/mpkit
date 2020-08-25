const { mergeApi, mergeView, MixinStore, MkApp, promiseifyApi } = require('../dist/index.cjs.js');
const { MpViewType, MpPlatform } = require('../../types/dist/index.cjs');
const { assert } = require('chai');
describe('Mixin', () => {
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
    describe('mergeView', () => {
        it('App&Page', () => {
            const state = {
            };
            const appSpec = mergeView(MpViewType.App, MpPlatform.wechat, [{
                before() {
                    state.count++;
                    state.before = true;
                },
                after() {
                    assert.equal(state.before, true)
                    state.after = true;
                },
                catch(methodName,
                    methodArgs,
                    error,
                    errType,
                    funId) {
                    state.catch = true;
                    assert.equal(error.message, 'test');
                    assert.equal(methodName, 'onHide');
                    assert.equal(methodArgs[0], 3);
                }
            }], {
                data: {
                    name: '1'
                },
                onShow() {
                    state.onShow1 = true;
                }
            }, {
                data: {
                    name: '2'
                },
                onShow() {
                    state.onShow2 = true;
                },
                onHide() {
                    throw new Error('test')
                }
            }, {
                methods: {
                    onShow() {
                        state.onShow3 = true;
                    }
                }
            });
            appSpec.onShow();
            assert.equal(state.onShow1, true);
            assert.equal(state.onShow3, undefined);
            assert.equal(state.onShow2, true);
            try {
                appSpec.onHide(3);
            } catch (error) {
                assert.equal(error.message, 'test');
            }
            assert.equal(state.before, true);
            assert.equal(state.after, true);
            assert.equal(state.catch, true);
            assert.equal(appSpec.data.name, '2');
        });
        it('Component', () => {
            const state = {
            };
            const spec = mergeView(MpViewType.Component, MpPlatform.wechat, [{
                before() {
                    state.count++;
                    state.before = true;
                },
            }], {
                methods: {
                    show() {
                        state.show1 = true;
                    }
                }
            }, {
                methods: {
                    show() {
                        state.show2 = true;
                    },
                    show3() {
                        state.show3 = true;
                    }
                }
            });
            spec.methods.show();
            assert.equal(state.before, true);
            assert.equal(state.show1, true);
            assert.equal(state.show2, true);
            assert.equal(!!state.show3, false);
        })
    })
    it('mergeApi', (done) => {
        const state = {}
        const mockApi = {
            name: 'Tom',
            method1(a) {
                state.method1 = true;
                state.a = a;
            },
            method3(a) {
                state.method3 = true;
                setTimeout(() => {
                    a && a.success();
                })
            },
            method2Sync() {
                return 2;
            },
            method4() {
                state.method4 = true;
            },
            method5() {
                state.method5 = true;
            }
        }
        const api = mergeApi(mockApi, [
            {
                before(name, args) {
                    if (name === 'method1') {
                        assert.equal(args[0], 2);
                    }
                    if (name === 'method4') {
                        return false;
                    }
                    if (name === 'method5') {
                        return 6;
                    }
                },
                complete(name, args, res, isSuccess) {
                    state.success = true;
                    assert.equal(isSuccess, true);
                }
            }
        ]);
        api.method1(2);
        assert.equal(state.method1, true);
        api.method3({
            success() {
                assert.equal(true, true);
                setTimeout(() => {
                    assert.equal(state.success, true);
                    done();
                })
            },
            fail() {
                assert.equal(false, true);
            }
        });
        assert.equal(api.method2Sync(), 2);
        api.method4();
        assert.equal(state.method4, undefined);
        const res = api.method5();
        assert.equal(state.method5, undefined);
        assert.equal(res, 6);
    });
    it('promiseifyApi', function (done) {
        this.timeout(5 * 1000);
        const check = (type) => {
            state[type] = true;
            if (state.t1 && state.t2 && state.t3) {
                done();
            }
        }
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
        promiseifyApi(mockApi, 'method1Sync', 3).then(res => {
            assert.equal(res, 3);
            check('t1');
        });
        promiseifyApi(mockApi, 'method3', {
            success() {
            }
        }).then(res => {
            assert.equal(res, undefined);
            assert.equal(state.method3, true);
            check('t2');
        });
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
    });
    it('MixinStore', () => {
        global.wx = {}
        with (global) {
            const state = {
            }
            MixinStore.addHook(MpViewType.App, {
                before() {
                    state.gloabl = true;
                }
            });
            const app = MkApp({
                onShow() {
                    state.onShow = true;
                }
            });
            app.onShow();
            assert.equal(state.onShow, true);
            assert.equal(state.gloabl, true);
        }
    });
});