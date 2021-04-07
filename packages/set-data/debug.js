const { openMpData, diffMpData } = require('./dist/index.cjs.js');
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
// assert.equal(keys3.length, 6);