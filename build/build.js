const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
let { version } = require('../lerna.json');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const rollupReplace = require('@rollup/plugin-replace');
const rollupJSON = require('@rollup/plugin-json');
const path = require('path');
const fs = require('fs');
const rollup = require('rollup');
const entrys = require('./entrys');
const rollupTS = require('@rollup/plugin-typescript')
const { replaceFileContent, oneByOne, clearDir, copyFiles, getDirList } = require('./util');
const getPackageName = (str) => {
    return (str || '').replace(path.resolve(__dirname, '../packages'), '');
}
const clear = dir => {
    if (fs.existsSync(dir)) {
        clearDir(dir);
    } else {
        fs.mkdirSync(dir);
    }
}
console.log(`version=${version}, ${typeof version}`);
version = version.split('.');
version[version.length - 1] = parseInt(version[version.length - 1]) + 1;
version = version.join('.');

console.log(`🌟开始编译...`);

const targetPackNames = process.argv.slice(2);
const specIsMoved = {};

oneByOne(entrys.map((rollupConfig, index) => {
    const packageName = getPackageName(rollupConfig.output.file);
    const currentPackName = packageName.split('/')[1];

    return () => {
        // 将所有的d.ts移到types目录下
        if (!specIsMoved[currentPackName]) {
            specIsMoved[currentPackName] = true;
            const arr = rollupConfig.input.input.split('/');
            arr.splice(arr.length - 1, 1);
            const packageRoot = arr.join('/');
            const typesOutDir = packageRoot + '/spec';
            copyFiles(packageRoot, typesOutDir, srcFile => {
                return srcFile.endsWith('.d.ts') && !srcFile.endsWith('global.d.ts') && !srcFile.endsWith('name.d.ts');
            }, true, targetFileName => {
                replaceFileContent(targetFileName, /\.\.\/types/, '@mpkit/types');
            })
        }
        if (targetPackNames.length && targetPackNames.every(item => item !== currentPackName)) {
            console.log(`   跳过编译：${packageName}`);
            return Promise.resolve();
        }

        if (!rollupConfig.input.external) {
            rollupConfig.input.external = [/\@mpkit\//]
        }
        rollupConfig.input.external.push(/lodash/);
        rollupConfig.input.external.push('parse5');
        if (!rollupConfig.input.plugins) {
            rollupConfig.input.plugins = [];
        }
        rollupConfig.input.plugins.push(nodeResolve());
        rollupConfig.input.plugins.push(rollupReplace({
            VERSION: version
        }));
        rollupConfig.input.plugins.push(rollupCommonjs());
        rollupConfig.input.plugins.push(rollupJSON());
        rollupConfig.input.plugins.push(rollupTS({
            declaration: false
        }));
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
        rollupConfig.output.sourcemap = true;
        rollupConfig.output.banner = `/*!
* MpKit v${version}
* (c) 2020-${new Date().getFullYear()} imingyu<mingyuhisoft@163.com>
* Released under the MIT License.
* Github: https://github.com/imingyu/mpkit
*/`;
        return rollup.rollup(rollupConfig.input).then(res => {
            return res.write(rollupConfig.output);
        }).then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    rollupConfig.options && rollupConfig.options.done && rollupConfig.options.done();
                    resolve();
                })
            })
        }).then(() => {
            console.log(`   编译成功：${packageName}`);
        })
    }
})).then(() => {
    console.log(`🌈编译结束.`);
}).catch(err => {
    console.error(`🔥编译出错：${err.message}`);
    console.log(err);
});

// const ebus = require('../packages/ebus');
// ebus.on()