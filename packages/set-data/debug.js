const { openMpData, diffMpData } = require('./dist/index.cjs.js');

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
compareR['c.b[3]'] = { b: 2 };
compareR['c.d'] = [];
compareR['c.f'] = [];
compareR['c.e[3]'] = 3;
console.log(compareR);

// const source = {
//     data: 3,
//     order: {
//         id: '123',
//         products: [
//             {
//                 name: '苹果',
//                 price: 3,
//                 count: 1
//             },
//             {
//                 name: '香蕉',
//                 price: 1,
//                 count: 3
//             }
//         ]
//     },
//     list: [
//         {
//             user: {
//                 name: 'Tom'
//             },
//             address: '上海'
//         },
//         {
//             user: {
//                 name: 'Alice',
//                 age: 10
//             },
//             address: '北京'
//         }
//     ]
// };

// const op1 = openMpData({
//     'list[0].address': '广州',
//     'list[0]': { address: '南京' },
//     'list[1].user.name': 'Jeck'
// }, source);
// const d3 = diffMpData(source, op1);
// const keys3 = Object.keys(d3)
// // assert.equal(keys3.length, 6);

// const t2 = JSON.parse(JSON.stringify(source));
// t2.data = 5;
// t2.list[0] = {
//     name: '11',
//     user: null
// };
// t2.list[5] = {
//     name: '22'
// }
// t2.order.products = [];
// const op2 = openMpData(t2, source);
// const d4 = diffMpData(source, op2);


// const s2 = {
//     c: {
//         b: [1],
//         d: [1, 2],
//         f: [1, 2, 3],
//         e: [1, 2, 3, 4, 5, 6, 7]
//     }
// };
// const d1 = openMpData({
//     'a.b': 2,
//     'a': 1,
//     'c': {},
//     'c.a': 2,
//     'c.b[0].a': 1,
//     'c.b': [],
//     'c.b[3].b': 2,
//     'c.b.length': 10,
//     'c.d': [],
//     'c.e[3]': 3,
//     'c.f.length': 0
// }, s2);
// const d2 = diffMpData(s2, d1);
// console.log(JSON.stringify(d1));