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
    if (rollupConfig.input.input.indexOf('inject/plugins') !== -1 || rollupConfig.input.input.indexOf('inject/config') !== -1) {
        return;
    }
    const arr = rollupConfig.input.input.split('/');
    arr.splice(arr.length - 1, 1);
    const packageRoot = arr.join('/');
    clear(path.join(packageRoot, 'spec'));
    clear(path.join(packageRoot, 'dist'));
});
console.log(`dist与spec目录已重置。`);