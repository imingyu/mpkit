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
        }));
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
        const d3 = diffMpData(source, t2);
        const keys3 = Object.keys(d3)
        assert.equal(keys3.length, 5);
        assert.equal('data' in d3, true);
        assert.equal(d3.data, 5);
        assert.equal("list[0].name" in d3, true);
        assert.equal("list[0].user" in d3, true);
        assert.equal(d3['list[0].name'], "11");
        assert.equal(d3['list[0].user'], null);
        assert.equal(d3['list[5]'].name, "22");
        assert.equal(JSON.stringify(d3['order.products']), "[]");
    })
})