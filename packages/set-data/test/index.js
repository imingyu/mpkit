const { openMpData, diffMpData } = require('../dist/index.cjs.js');
const { assert } = require('chai');

describe('SetData', () => {
    it('openMpData', () => {
        const data = openMpData({
            'list[0].user': {
                name: 'Tom'
            },
            'data': 3,
            'list[2].user.name': 'Alice',
            'list[2].user.name': {
                value: 'Alice'
            }
        });
        assert.equal(Array.isArray(data.list), true);
        assert.equal(data.list.length, 3);
        assert.equal(data.list[0].user.name, 'Tom');
        assert.equal(data.list[2].user.name.value, 'Alice');

        const data2 = openMpData({
            show1: true,
            show2: false,
            show3: null,
            show4: undefined,
            'list[2].user.name': {
                value: 'Alice',
                show1: true,
                show2: false,
                show3: null,
                show4: undefined,
            }
        });
    });
    it('openMpData:后面的会覆盖前面的', () => {
        const d1 = openMpData({
            'a.b': 2,
            'a': 1,
            'c': {},
            'c.a': 2,
            'c.b[0].a': 1,
            'c.b': [],
            'c.b[3].b': 2,
            'c.b.length': 10,
            'c.d': [],
            'c.e[3]': 3,
            'c.f.length': 0
        }, {
            c: {
                b: [1],
                d: [1, 2],
                f: [1, 2, 3],
                e: [1, 2, 3, 4, 5, 6, 7]
            }
        });
        assert.equal(d1.a, 1);
        assert.isObject(d1.c);
        assert.equal(d1.c.a, 2);
        assert.equal(d1.c.b.length, 10);
        assert.equal(d1.c.b[9], undefined);
        assert.equal(d1.c.b[0], undefined);
        assert.equal(d1.c.b[3].b, 2);
        assert.equal(d1.c.f.length, 0);
        assert.equal(d1.c.d.length, 0);
        assert.equal(d1.c.e.length, 7);
        assert.equal(d1.c.e[3], 3);
    });
    it('diffMpData', () => {
        const source = {
            data: 3,
            order: {
                id: '123',
                products: [
                    {
                        name: '苹果',
                        price: 3,
                        count: 1
                    },
                    {
                        name: '香蕉',
                        price: 1,
                        count: 3
                    }
                ]
            },
            list: [
                {
                    user: {
                        name: 'Tom'
                    },
                    address: '上海'
                },
                {
                    user: {
                        name: 'Alice'
                    },
                    address: '北京'
                }
            ]
        };
        const d1 = diffMpData(source, openMpData({
            'list[0].user.name': 'Jeck'
        }, source));
        const keys = Object.keys(d1)
        assert.equal(keys.length, 1);
        assert.equal(keys[0], "list[0].user.name");
        assert.equal(d1[keys[0]], 'Jeck');

        const t1 = JSON.parse(JSON.stringify(source));
        t1.list[0].user.name = 'Lilei';
        const d2 = diffMpData(source, t1);
        const keys2 = Object.keys(d2)
        assert.equal(keys2.length, 1);
        assert.equal(keys2[0], "list[0].user.name");
        assert.equal(d2[keys2[0]], 'Lilei');

        const t2 = JSON.parse(JSON.stringify(source));
        t2.data = 5;
        t2.list[0] = {
            name: '11',
            user: null
        };
        t2.list[5] = {
            name: '22'
        }
        t2.order.products = [];
        const d3 = diffMpData(source, openMpData(t2, source));
        const keys3 = Object.keys(d3)
        assert.equal(keys3.length, 6);
        assert.equal('data' in d3, true);
        assert.equal(d3.data, 5);
        assert.equal(d3["list.length"], 6);
        assert.equal("list[0].name" in d3, true);
        assert.equal("list[0].user" in d3, true);
        assert.equal(d3['list[0].name'], "11");
        assert.equal(d3['list[0].user'], null);
        assert.equal(d3['list[5]'].name, "22");
        assert.equal(JSON.stringify(d3['order.products']), "[]");



        const sourceFull = {
            c: {
                b: [1],
                d: [1, 2],
                f: [1, 2, 3],
                e: [1, 2, 3, 4, 5, 6, 7]
            }
        }
        const targetFull = openMpData({
            'a.b': 2,
            'a': 1,
            'c': {},
            'c.a': 2,
            'c.b[0].a': 1,
            'c.b': [],
            'c.b[3].b': 2,
            'c.b.length': 10,
            'c.d': [],
            'c.e[3]': 3,
            'c.f.length': 0
        }, sourceFull);
        const diffR = diffMpData(sourceFull, targetFull);
        const compareR = {};
        compareR.a = 1;
        compareR['c.a'] = 2;
        compareR['c.b.length'] = 10;
        compareR['c.b[3]'] = { b: 2 };
        compareR['c.d'] = [];
        compareR['c.f.length'] = 0;
        compareR['c.e[3]'] = 3;
        const keysS1 = Object.keys(compareR);
        let l1 = keysS1.length;
        const keysS2 = Object.keys(diffR);
        let l2 = keysS1.length;
        keysS2.forEach(key => {
            assert.equal(keysS1.find(item => item === key), key);
            l1--;
            l2--;
            assert.equal(JSON.stringify(compareR[key]), JSON.stringify(diffR[key]))
        })
        assert.equal(l1, 0);
        assert.equal(l2, 0);
    })
})