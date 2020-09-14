const path = require('path');
const { replaceFileContent } = require('./util');
const resolveFile = fileName => path.resolve(__dirname, `../packages${fileName}`);
const formats = ['cjs', 'esm'];
const replaceInjectModules = function () {
    const fileName = typeof this.output === 'object' ? this.output.file : this.output;
    const isPlugin = fileName.indexOf('plugins') !== -1;
    replaceFileContent(fileName, [
        [/\@mpkit\/util/g, isPlugin ? '../util' : './util'],
        [/\@mpkit\/types/g, isPlugin ? '../types' : './types'],
    ])
}
const convertOptions = (options, format) => {
    if (options.packageName) {
        return {
            input: {
                input: options.input || resolveFile(`/${options.packageName}/index.ts`)
            },
            output: {
                format,
                file: options.output || resolveFile(`/${options.packageName}/dist/index.${format}.js`),
            }
        }
    }
    return {
        input: typeof options.input === 'object' ? options.input : {
            input: options.input
        },
        output: Object.assign({
            format,
            file: typeof options.output === 'object' ? options.output.file : options.output
        }, typeof options.output === 'object' ? options.output : {}),
        options
    }
}
module.exports = [
    {
        packageName: 'inject',
        formats: ['esm'],
        entrys: [
            {
                input: {
                    input: resolveFile(`/inject/index.ts`),
                    external: [
                        /\.\/config/,
                        /\@mpkit\/util/,
                        /\@mpkit\/types/
                    ]
                },
                output: resolveFile(`/inject/dist/index.js`),
                done: replaceInjectModules
            },
            {
                input: resolveFile(`/inject/config.ts`),
                output: resolveFile(`/inject/dist/config.js`)
            },
            {
                input: {
                    input: resolveFile(`/inject/plugins/ebus.ts`),
                    external: [
                        /\@mpkit\/util/,
                        /\@mpkit\/types/
                    ],
                },
                output: resolveFile(`/inject/dist/plugins/ebus.js`),
                done: replaceInjectModules
            },
            {
                input: {
                    input: resolveFile(`/inject/plugins/mixin.ts`),
                    external: [
                        /\@mpkit\/util/,
                        /\@mpkit\/types/
                    ]
                },
                output: resolveFile(`/inject/dist/plugins/mixin.js`),
                done: replaceInjectModules
            },
            {
                input: {
                    input: resolveFile(`/inject/plugins/set-data.ts`),
                    external: [
                        /\@mpkit\/util/,
                        /\@mpkit\/types/
                    ]
                },
                output: resolveFile(`/inject/dist/plugins/set-data.js`),
                done: replaceInjectModules
            },
            {
                input: {
                    input: resolveFile(`/inject/types.ts`),
                    external: [
                    ]
                },
                output: resolveFile(`/inject/dist/types.js`),
            },
            {
                input: {
                    input: resolveFile(`/inject/util.ts`),
                    external: [
                        /\@mpkit\/types/
                    ]
                },
                output: resolveFile(`/inject/dist/util.js`),
                done: replaceInjectModules
            }
        ]
    },
    {
        packageName: 'view-parser',
        formats: ['umd'],
        entrys: [
            {
                input: {
                    input: resolveFile(`/view-parser/index.ts`),
                    external: [
                    ]
                },
                output: {
                    file: resolveFile(`/view-parser/dist/index.js`),
                    name: 'MpKitViewParser'
                }
            }
        ]
    },
    'view-parser',
    'mixin',
    'set-data',
    'ebus',
    'types',
    'util',
].reduce((sum, package) => {
    package = typeof package === 'object' ? package : {
        packageName: package
    }
    if (!package.formats) {
        package.formats = [...formats];
    }
    package.formats.forEach((format, index) => {
        if (package.entrys) {
            package.entrys.forEach(options => {
                sum.push(convertOptions(options, format));
            })
        } else {
            sum.push(convertOptions(package, format));
        }
    });
    return sum;
}, [])