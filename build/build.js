const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
let { version } = require('../lerna.json');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const rollupReplace = require('@rollup/plugin-replace');
const rollupJSON = require('@rollup/plugin-json');
const path = require('path');
const rollup = require('rollup');
const entrys = require('./entrys');
const rollupTS = require('@rollup/plugin-typescript')
const { replaceFileContent, oneByOne, copyFiles } = require('./util');
const getPackageName = (str) => {
    return (str || '').replace(path.resolve(__dirname, '../packages'), '');
}
console.log(`version=${version}, ${typeof version}`);
version = version.split('.');
version[version.length - 1] = parseInt(version[version.length - 1]) + 1;
version = version.join('.');

console.log(`🌟开始编译...`);

const targetPackNames = process.argv.slice(2);
const specIsMoved = {};

entrys.forEach(item => {
    if (item.output.format === 'umd' && !item.mini) {
        const ni = {
            input: {
                input: item.input.input,
                external: [
                    ...item.input.external
                ]
            },
            output: {
                ...item.output
            },
            done: item.done,
            mini: true
        };
        ni.output.file = ni.output.file.substr(0, ni.output.file.length - 2) + 'mini.js';
        entrys.push(ni)
    }
})

oneByOne(entrys.map((rollupConfig, index) => {
    const packageName = getPackageName(rollupConfig.output.file);
    const currentPackName = packageName.split('/')[1];

    return () => {
        if (targetPackNames.length && targetPackNames.every(item => item !== currentPackName)) {
            console.log(`   跳过编译：${packageName}`);
            return Promise.resolve();
        }
        if (!rollupConfig.input.external) {
            rollupConfig.input.external = [/\@mpkit\//]
            rollupConfig.input.external.push(/lodash/);
        }
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
        if (rollupConfig.mini) {
            rollupConfig.input.plugins.push(uglify({
                sourcemap: true
            }));
        }
        rollupConfig.output.sourcemap = true;
        rollupConfig.output.banner = `/*!
* MpKit v${version}
* (c) 2020-${new Date().getFullYear()} imingyu<mingyuhisoft@163.com>
* Released under the MIT License.
* Github: https://github.com/imingyu/mpkit/tree/master/packages/${packageName}
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
}).concat(entrys.map((rollupConfig, index) => {
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
        return Promise.resolve();
    }
}))).then(() => {
    console.log(`🌈编译结束.`);
}).catch(err => {
    console.error(`🔥编译出错：${err.message}`);
    console.log(err);
});

// const ebus = require('../packages/ebus');
// ebus.on()