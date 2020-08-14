const { mergeApi, mergeView } = require('../dist/index.cjs.js');
const { assert } = require('chai');
describe('Mixin', () => {
    describe('mergeView', () => {
        it('App&Page', () => {
            const state = {
            };
            const appSpec = mergeView([{
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
            });
            appSpec.onShow();
            assert.equal(state.onShow1, true);
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
            const spec = mergeView([], {
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
            assert.equal(state.show1, true);
            assert.equal(state.show2, true);
            assert.equal(!!state.show3, false);
        })
    })
});