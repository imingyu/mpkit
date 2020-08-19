const fs = require('fs')
const path = require('path')
exports.clearDir = dirName => {
    fs.readdirSync(dirName).forEach(fileName => {
        const fullName = path.join(dirName, fileName);
        const stat = fs.statSync(fullName)
        if (stat.isFile()) {
            fs.unlinkSync(fullName)
        } else if (stat.isDirectory()) {
            exports.clearDir(fullName);
        }
    })
}

exports.replaceFileContent = (fileName, source, target) => {
    let content = fs.readFileSync(fileName, 'utf8');
    if (Array.isArray(source)) {
        source.forEach(item => {
            content = content.replace(item[0], item[1]);
        })
    } else {
        content = content.replace(source, target);
    }
    fs.writeFileSync(fileName, content, 'utf8');
}

exports.oneByOne = promiseHandlers => {
    return new Promise((resolve, reject) => {
        let index = 0;
        const exec = () => {
            promiseHandlers[index]().then(() => {
                index++;
                if (index < promiseHandlers.length) {
                    exec();
                } else {
                    resolve();
                }
            }).catch(reject);
        }
        exec();
    })
}