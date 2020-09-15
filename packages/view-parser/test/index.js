const { parseMpXml, TAG_NOT_CLOSE } = require('../dist/index.cjs.js');
const { MpPlatform } = require('@mpkit/types');
const { assert } = require('chai');

describe('parse', () => {

    it('tag not close', () => {
        const xml = `<view>123<text>456</text>`;
        const res = parseMpXml(xml, MpPlatform.wechat);
        if (!res.error) {
            throw 'err';
        }
        assert.equal(res.error.message, TAG_NOT_CLOSE);
    });

    it('tag head close wrong', () => {
        const xml = `<view 123<text>456</text>`;
        const res = parseMpXml(xml, MpPlatform.wechat);
        if (!res.error) {
            throw 'err';
        }
        assert.equal(res.error.message, TAG_NOT_CLOSE);
    });

});