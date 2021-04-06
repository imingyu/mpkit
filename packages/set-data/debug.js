const { openMpData, diffMpData } = require('./dist/index.cjs.js');

const dd = openMpData({
    a: {
        b: 1
    }
}, {
    a: {
        c: 1
    }
});
const ss = diffMpData({
    a: {
        c: 1
    }
}, dd);

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
const op1 = openMpData(t2, source);
const d3 = diffMpData(source, op1);
const keys3 = Object.keys(d3)

class MNode {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    link(node) {
        this.next = node;
        node.prev = this;
    }
}

const n1 = new MNode(1, 'n1');
const n2 = new MNode(2, 'n2');
const n3 = new MNode(3, 'n3');
n1.link(n2);
n2.link(n3)

const res = openMpData(n1)
console.log(res);

const res2 = diffMpData(n1, n2);

console.log(res2);
