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
const { replaceFileContent, oneByOne, copyFiles, rmdirSync } = require('./util');
const { readdirSync, existsSync, mkdirSync } = require('fs');
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

const cloneEntry = (source) => {
    const res = {
        packageName: source.packageName,
        input: {
            input: source.input.input,
        },
        output: {
            ...source.output
        },
        done: source.done,
    };
    if (source.output.globals) {
        res.output.globals = {
            ...source.output.globals
        }
    }
    if (source.input.external) {
        res.input.external = [
            ...source.input.external
        ]
    }
    return res;
}

let index = -1;
entrys.forEach((item) => {
    index++;
    if (item.output.format === 'umd' && !item.output.globals) {
        item.output.globals = {
            'forgiving-xml-parser': 'ForgivingXmlParser',
        }
        if (item.packageName !== 'util') {
            item.output.globals['@mpkit/util'] = 'MpKitUtil';
        }
        if (item.packageName !== 'types') {
            item.output.globals['@mpkit/types'] = 'MpKitTypes';
        }
    }
    if (item.output.format === 'umd' && !item.mini && !item.inclueFx) {
        const ni = cloneEntry(item);
        ni.mini = true;
        ni.output.file = ni.output.file.substr(0, ni.output.file.length - 2) + 'mini.js';
        entrys.splice(index, 0, ni);
        index++;
        if (item.packageName === 'mpxml-parser' || item.packageName === 'mixin') {
            console.log(`loop ${item.packageName} ${item.output.file}`);
            const ni = cloneEntry(item);
            ni.inclueFx = true;
            ni.output.file = ni.output.file.substr(0, ni.output.file.length - 2) + 'full.js';
            entrys.splice(index, 0, ni);
            index++;

            const ni2 = cloneEntry(item);
            ni2.inclueFx = true;
            ni2.mini = true;
            ni2.output.file = ni2.output.file.substr(0, ni2.output.file.length - 2) + 'full.mini.js';
            entrys.splice(index, 0, ni2);
        }
    }
});
console.log(`entrys=.length=${entrys.length}`);

oneByOne(entrys.map((rollupConfig, index) => {
    const packageName = getPackageName(rollupConfig.output.file);
    const currentPackName = packageName.split('/')[1];

    return () => {
        console.log(`   开始编译：${packageName}#${index}`)
        if (targetPackNames.length && targetPackNames.every(item => item !== currentPackName)) {
            console.log(`   跳过编译：${packageName}`);
            return Promise.resolve();
        }
        if (!rollupConfig.input.external) {
            rollupConfig.input.external = [/\@mpkit\//]
            rollupConfig.input.external.push(/lodash/);
            rollupConfig.input.external.push(/forgiving-xml-parser/);
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
        if (rollupConfig.inclueFx) {
            delete rollupConfig.input.external;
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
    console.log(`🌈编译结束，开始转移d.ts`);

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
    console.log(`🌈转移结束，开始复制到根目录的dist中`);
    const root = path.resolve(__dirname, "../packages");
    const dist = path.resolve(__dirname, '../dist');
    if (existsSync(dist)) {
        rmdirSync(dist);
    }
    mkdirSync(dist);
    readdirSync(root).forEach(dir => {
        if (dir.indexOf('.') === 0) {
            return;
        }
        const dirDist = path.join(root, dir, 'dist');
        if (existsSync(dirDist)) {
            mkdirSync(path.join(dist, dir));
            copyFiles(dirDist, path.join(dist, dir), '*', false);
        }
    })
    console.log(`🌈编译全部成功.`);
}).catch(err => {
    console.error(`🔥编译出错：${err.message}`);
    console.log(err);
});
