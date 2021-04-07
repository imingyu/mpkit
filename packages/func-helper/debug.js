const { replaceFunc, hookFunc } = require('./dist/index.cjs.js'); const data = {};
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
        done(s) {
            data.s = s;
            data.done = true;
        }
    }
];
const foo2 = hookFunc(foo, false, hooks, {
    e: 1
}).func;
const res = foo2();
console.log(data);
res.then(() => {
    console.log(data);
})