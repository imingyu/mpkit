const { openMpData, diffMpData } = require('../dist/index.cjs.js');


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
