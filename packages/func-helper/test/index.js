const { replaceFunc, hookFunc } = require('../dist/index.cjs.js');
const { assert } = require('chai');

describe('FuncHelper', () => {
    it('ReplaceFunc', () => {
        const state = {}
        const foo = () => {
            if (!state.a) {
                state.a = 0
            }
            state.a++;
        }
        const foo2 = replaceFunc(foo, () => {
            if (!state.d) {
                state.d = 0
            }
            state.d++;
        }, store => {
            state.c = store;
        }, {
            b: 1
        });
        assert.isTrue('c' in state);
        assert.equal(state.c.data.b, 1);
        assert.equal(state.c.original, foo);
        foo2();
        assert.isTrue(!('a' in state));
        assert.equal(state.d, 1);
        state.c.restore();
        foo2();
        assert.equal(state.a, 1);
        state.c.replace();
        foo2();
        assert.equal(state.a, 1);
        assert.equal(state.d, 2);
    });
    describe('HookFunc', () => {
        it('hooksInvariant=true', () => {
            const hooksInvariant = true;
            const data = {};
            const foo = () => {
                if (!data.a) {
                    data.a = 0
                }
                data.a++;
            }
            const hooks = [];
            const foo2 = hookFunc(foo, hooksInvariant, hooks, {
                e: 1
            }).func;
            foo2();
            assert.equal(data.a, 1);
            hooks.push({
                before() {
                    data.before = true;
                },
                after() {
                    data.after = true;
                },
                catch() {
                    data.catch = true;
                },
                complete() {
                    data.complete = true;
                }
            });
            foo2();
            assert.isTrue(!('before' in data));
            assert.isTrue(!('after' in data));
            assert.isTrue(!('catch' in data));
            assert.isTrue(!('complete' in data));
            assert.equal(data.a, 2);

            const foo3 = hookFunc(foo, hooksInvariant, [
                {
                    before(s) {
                        data.before = true;
                        assert.equal(s.state.e, 2);
                    },
                    after: [
                        () => {
                            data.after = true;
                        },
                        () => {
                            data.after2 = true;
                        },
                    ],
                    catch() {
                        data.catch = true;
                    },
                    complete() {
                        data.complete = true;
                    }
                }
            ], {
                e: 2
            }).func;
            foo3();
            assert.equal(data.a, 3);
            assert.isTrue('before' in data);
            assert.isTrue('after' in data);
            assert.isTrue('after2' in data);
            assert.isTrue(!('catch' in data));
            assert.isTrue(!('complete' in data));
        });
        it('hooksInvariant=false', () => {
            const hooksInvariant = false;
            const data = {};
            const foo = () => {
                if (!data.a) {
                    data.a = 0
                }
                data.a++;
            }
            const hooks = [];
            const foo2 = hookFunc(foo, hooksInvariant, hooks, {
                e: 1
            }).func;
            foo2();
            assert.equal(data.a, 1);
            hooks.push({
                before() {
                    data.before = true;
                },
                after() {
                    data.after = true;
                },
                catch() {
                    data.catch = true;
                },
                complete() {
                    data.complete = true;
                }
            });
            foo2();
            assert.isTrue(('before' in data));
            assert.isTrue(('after' in data));
            assert.isTrue(!('catch' in data));
            assert.isTrue(!('complete' in data));
            assert.equal(data.a, 2);
        });
        it('promise', (done) => {
            const data = {};
            const foo = () => {
                if (!data.a) {
                    data.a = 0
                }
                data.a++;
                return Promise.resolve(data.a);
            }
            const hooks = [
                {
                    before() {
                        data.before = true;
                    },
                    after() {
                        data.after = true;
                    },
                    catch() {
                        data.catch = true;
                    },
                    complete(s) {
                        data.complete = true;
                        assert.equal(s.value, data.a);
                    },
                    done() {
                        data.done = true;
                    }
                }
            ];
            const foo2 = hookFunc(foo, false, hooks, {
                e: 1
            }).func;
            const res = foo2();
            assert.isTrue(('before' in data));
            assert.isTrue(('after' in data));
            assert.isTrue(!('catch' in data));
            assert.isTrue(!('done' in data));
            assert.isTrue(!('complete' in data));
            assert.equal(data.a, 1);
            console.log('1.' + JSON.stringify(data));
            res.then(() => {
                console.log('1.' + JSON.stringify(data));
                assert.isTrue(('done' in data));
                assert.isTrue(('complete' in data));
                done();
            })
        })
    });
})