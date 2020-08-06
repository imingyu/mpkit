const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const rollupJSON = require('@rollup/plugin-json');
const path = require('path');
const rollup = require('rollup');
const entrys = require('./entrys');
const rollupTS = require('@rollup/plugin-typescript')

const getPackageName = (str) => {
    return str.replace(path.resolve(__dirname, '../packages'), '');
}

console.log(`🌟开始编译...`);
Promise.all(entrys.map((rollupConfig, index) => {
    if (!rollupConfig.input.external) {
        rollupConfig.input.external = []
    }
    rollupConfig.input.external.push('lodash');
    rollupConfig.input.external.push('fast-xml-parser');
    rollupConfig.input.external.push(/\@mpkit\//);
    if (!rollupConfig.input.plugins) {
        rollupConfig.input.plugins = [];
    }
    rollupConfig.input.plugins.push(nodeResolve());
    rollupConfig.input.plugins.push(rollupJSON());
    rollupConfig.input.plugins.push(rollupTS());
    rollupConfig.input.plugins.push(babel({
        extensions: ['.ts', '.js'],
        babelHelpers: 'bundled',
        include: [
            'packages/**/*.ts'
        ],
        exclude: [
            'node_modules'
        ],
        extends: path.resolve(__dirname, '../.babelrc')
    }));
    const packageName = getPackageName(rollupConfig.output.file);
    return rollup.rollup(rollupConfig.input).then(res => {
        return res.write(rollupConfig.output);
    }).then(() => {
        console.log(`   编译成功：${packageName}`);
    })
})).then(() => {
    console.log(`🌈编译结束.`);
}).catch(err => {
    console.error(`🔥编译出错：${err.message}`);
    console.log(err);
});