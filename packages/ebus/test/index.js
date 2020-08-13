const { assert } = require("chai");
const { EventEmitter, on, off, emit } = require('../dist/index.cjs');
describe("Ebus", () => {
    it('功能', done => {
        const state = {};
        const ev = new EventEmitter();
        ev.on('e1', e => {
            assert.equal(false, true);
        });
        ev.on('e2', e => {
            assert.equal(data, e.data);
            assert.equal('e2', e.type);
            checkDone('e2');
        });
        const checkDone = type => {
            state[type] = true;
            if (state.on && state.off && state.e2) {
                done();
            }
        }
        const data = {};
        let count = 0;
        on("e1", e => {
            assert.equal(data, e.data);
            assert.equal('e1', e.type);
            count++;
            if (count > 1) {
                console.error('未正确卸载on')
                assert.equal(false, true);
            }
            checkDone('on');
        });
        emit('e1', data);
        off('e1');
        emit('e1', data);
        checkDone('off');
        ev.emit('e2', data);
    })
})