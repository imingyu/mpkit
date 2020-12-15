const { parseMpXml, TAG_NOT_CLOSE, BRACKET_THAN_TWO, BRACKET_NOT_CLOSE, ATTR_CONTENT_HAS_MORE_VAR, ATTR_WHERE_NOT_IF } = require('../dist/index.cjs.js');
const { MpPlatform } = require('@mpkit/types');
const { assert } = require('chai');

describe('ViewParser', () => {

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

    it('bracket wrong', () => {
        assert.equal(parseMpXml(`<text>{{{name}}</text>`, MpPlatform.wechat).error.message, BRACKET_THAN_TWO);
        assert.equal(parseMpXml(`<text>{{name</text>`, MpPlatform.wechat).error.message, BRACKET_NOT_CLOSE);
        assert.equal(!parseMpXml(`<text>{name</text>`, MpPlatform.wechat).error, true);
    });

    describe('where attr', () => {
        it('is empty or static value', () => {
            assert.equal(!parseMpXml(`<view wx:if=""></view>`, MpPlatform.wechat).error, true);
            assert.equal(!parseMpXml(`<view wx:if="123"></view>`, MpPlatform.wechat).error, true);
            assert.equal(!parseMpXml(`<view wx:if="{s"></view>`, MpPlatform.wechat).error, true);
        });
        it('braket wrong', () => {
            assert.equal(parseMpXml(`<view wx:if="{{a}} {{b}}"></view>`, MpPlatform.wechat).error.message, ATTR_CONTENT_HAS_MORE_VAR);
            assert.equal(parseMpXml(`<view wx:if="{{{a}} {{b}}"></view>`, MpPlatform.wechat).error.message, BRACKET_THAN_TWO);
            assert.equal(parseMpXml(`<view wx:if="{{a"></view>`, MpPlatform.wechat).error.message, BRACKET_NOT_CLOSE);
        });
        it('close wrong', () => {
            assert.equal(parseMpXml(`<view wx:elif="{{a}}"></view>`, MpPlatform.wechat).error.message, ATTR_WHERE_NOT_IF);
            assert.equal(parseMpXml(`<view wx:else></view>`, MpPlatform.wechat).error.message, ATTR_WHERE_NOT_IF);
        });
        it('parse if', () => {
            const res1 = parseMpXml(`<view wx:if="{{a}}"></view>`, MpPlatform.wechat);
            assert.equal(res1.elements.length, 1);
            assert.equal(res1.elements[0].attrs[0].name, 'wx:if');
            assert.equal(res1.elements[0].attrs[0].content[0].type, 'dynamic');
            assert.equal(res1.elements[0].attrs[0].content[0].value, 'a');
        });
        it('parse elif', () => {
            const res1 = parseMpXml(`<view wx:if="{{a}}" name="hi {{name}}"></view><view wx:elif="{{b}}"></view><view wx:else></view>`, MpPlatform.wechat);
            assert.equal(res1.elements.length, 3);
            assert.equal(res1.elements[0].attrs[0].name, 'wx:if');
            assert.equal(res1.elements[0].attrs[0].content[0].type, 'dynamic');
            assert.equal(res1.elements[0].attrs[0].content[0].value, 'a');
            assert.equal(res1.elements[0].attrs[1].name, 'name');
            assert.equal(res1.elements[0].attrs[1].content[0].type, 'static');
            assert.equal(res1.elements[0].attrs[1].content[0].value, 'hi ');
            assert.equal(res1.elements[0].attrs[1].content[1].type, 'dynamic');
            assert.equal(res1.elements[0].attrs[1].content[1].value, 'name');
            assert.equal(res1.elements[1].attrs[0].name, 'wx:elif');
            assert.equal(res1.elements[1].attrs[0].content[0].type, 'dynamic');
            assert.equal(res1.elements[1].attrs[0].content[0].value, 'b');
            assert.equal(res1.elements[2].attrs[0].name, 'wx:else');
            assert.equal(!res1.elements[2].attrs[0].content, true);
        });
    });

    describe('for attr', () => {
    });
});