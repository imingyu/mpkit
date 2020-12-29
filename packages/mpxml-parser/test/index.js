const { parseMpXml } = require('../dist/index.cjs.js');
const { MpPlatform } = require('@mpkit/types');
const { assert } = require('chai');

describe('MpxmlParser', () => {

    it('tag not close', () => {
        const xml = `<view>123<text>456</view>`;
        const res = parseMpXml(xml, MpPlatform.wechat);
        if (!res.error) {
            throw 'err';
        }
        assert.equal(res.error.code, 4);
    });

    it('tag head close wrong', () => {
        const xml = `<view 123<text>456</text>`;
        const res = parseMpXml(xml, MpPlatform.wechat);
        if (!res.error) {
            throw 'err';
        }
        assert.equal(res.error.code, 14);
    });

    it('bracket wrong', () => {
        assert.equal(parseMpXml(`<text>{{{name}}</text>`, MpPlatform.wechat).error.code, 100);
        assert.equal(parseMpXml(`<text>{{name</text>`, MpPlatform.wechat).error.code, 101);
        assert.equal(!parseMpXml(`<text>{name</text>`, MpPlatform.wechat).error, true);
    });

    describe('where attr', () => {
        it('is empty or static value', () => {
            assert.equal(!parseMpXml(`<view wx:if=""></view>`, MpPlatform.wechat).error, true);
            assert.equal(!parseMpXml(`<view wx:if="123"></view>`, MpPlatform.wechat).error, true);
            assert.equal(!parseMpXml(`<view wx:if="{s"></view>`, MpPlatform.wechat).error, true);
        });
        // it('braket wrong', () => {
        //     assert.equal(parseMpXml(`<view wx:if="{{a}} {{b}}"></view>`, MpPlatform.wechat).error.message, ATTR_CONTENT_HAS_MORE_VAR);
        //     assert.equal(parseMpXml(`<view wx:if="{{{a}} {{b}}"></view>`, MpPlatform.wechat).error.message, BRACKET_THAN_TWO);
        //     assert.equal(parseMpXml(`<view wx:if="{{a"></view>`, MpPlatform.wechat).error.message, BRACKET_NOT_CLOSE);
        // });
        it('close wrong', () => {
            assert.equal(parseMpXml(`<view wx:elif="{{a}}"></view>`, MpPlatform.wechat).error.code, 106);
            assert.equal(parseMpXml(`<view wx:else></view>`, MpPlatform.wechat).error.code, 106);
        });
        it('parse if', () => {
            const res1 = parseMpXml(`<view wx:if="{{a}}"></view>`, MpPlatform.wechat);
            assert.equal(res1.nodes.length, 1);
            assert.equal(res1.nodes[0].attrs[0].name, 'wx:if');
            assert.equal(res1.nodes[0].attrs[0].mpContents[0].type, 'dynamic');
            assert.equal(res1.nodes[0].attrs[0].mpContents[0].value, 'a');
        });
        it('parse elif', () => {
            const res1 = parseMpXml(`<view wx:if="{{a}}" name="hi {{name}}"></view><view wx:elif="{{b}}"></view><view wx:else></view>`, MpPlatform.wechat);
            assert.equal(res1.nodes.length, 3);
            assert.equal(res1.nodes[0].attrs[0].name, 'wx:if');
            assert.equal(res1.nodes[0].attrs[0].mpContents[0].type, 'dynamic');
            assert.equal(res1.nodes[0].attrs[0].mpContents[0].value, 'a');
            assert.equal(res1.nodes[0].attrs[1].name, 'name');
            assert.equal(res1.nodes[0].attrs[1].mpContents[0].type, 'static');
            assert.equal(res1.nodes[0].attrs[1].mpContents[0].value, 'hi ');
            assert.equal(res1.nodes[0].attrs[1].mpContents[1].type, 'dynamic');
            assert.equal(res1.nodes[0].attrs[1].mpContents[1].value, 'name');
            assert.equal(res1.nodes[1].attrs[0].name, 'wx:elif');
            assert.equal(res1.nodes[1].attrs[0].mpContents[0].type, 'dynamic');
            assert.equal(res1.nodes[1].attrs[0].mpContents[0].value, 'b');
            assert.equal(res1.nodes[2].attrs[0].name, 'wx:else');
            assert.equal(!res1.nodes[2].attrs[0].mpContents, true);
        });
    });

    // describe('for attr', () => {
    // });
});