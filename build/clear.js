const entrys = require('./entrys');
const path = require('path');
const fs = require('fs');
const { clearDir } = require('./util');
const clear = dir => {
    if (fs.existsSync(dir)) {
        clearDir(dir);
    } else {
        fs.mkdirSync(dir);
    }
}
let mark = {};
entrys.forEach(rollupConfig => {
    if (!mark[rollupConfig.packageName]) {
        mark[rollupConfig.packageName] = true;
        clear(path.resolve(__dirname, `../packages/${rollupConfig.packageName}/dist`));
        clear(path.resolve(__dirname, `../packages/${rollupConfig.packageName}/spec`));
    }
});
console.log(`dist与spec目录已重置。`);