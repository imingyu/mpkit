const path = require('path');
const resolveFile = fileName => path.resolve(__dirname, `../packages${fileName}`);
const formats = ['cjs', 'esm']
module.exports = [
    'types',
    'view-parser',
    'mixin',
    'inject',
    'util',
    'ebus'
    // {
    //     packageName:'types',
    //     formats
    // }
].reduce((sum, package) => {
    package = typeof package === 'object' ? package : {
        packageName: package
    }
    if (!package.formats) {
        package.formats = formats;
    }
    package.formats.forEach((format, index) => {
        const config = {
            input: {
                input: resolveFile(`/${package.packageName}/index.ts`)
            },
            output: {
                format,
                file: resolveFile(`/${package.packageName}/dist/index.${format}.js`),
            }
        }
        sum.push(config);
    });
    return sum;
}, [])