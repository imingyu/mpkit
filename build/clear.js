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
entrys.forEach(rollupConfig => {
    // 将所有的d.ts移到types目录下
    if (rollupConfig.input.input.indexOf('inject/plugins') !== -1 || rollupConfig.input.input.indexOf('inject/config') !== -1) {
        return;
    }
    const arr = rollupConfig.input.input.split('/');
    arr.splice(arr.length - 1, 1);
    const packageRoot = arr.join('/');
    clear(path.join(packageRoot, 'dist'));
});
console.log(`dist目录已重置。`);