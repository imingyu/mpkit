const fs = require('fs');
const fse = require('fse');
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

exports.getDirList = (dirName, deep, list) => {
    list = list || [];
    fs.readdirSync(dirName).forEach(fileName => {
        const fullName = path.join(dirName, fileName);
        const stat = fs.statSync(fullName)
        if (stat.isDirectory()) {
            list.push([fullName, fileName, dirName])
            deep && exports.getDirList(fullName, deep, list);
        }
    });
    return list;
}

exports.copyFiles = (sourceDir, targetDir, fileNameChar, deleteSourceFile, loopCallback) => {
    fs.readdirSync(sourceDir).forEach(item => {
        const sourceName = path.join(sourceDir, item);
        if (sourceName === targetDir || sourceName.indexOf('node_modules') !== -1) {
            return;
        }
        const targetName = path.join(targetDir, item);
        const stat = fs.statSync(sourceName)
        if (stat.isFile()) {
            if ((typeof fileNameChar === 'function' && fileNameChar(sourceName)) || (typeof fileNameChar === 'string' && sourceName.indexOf(fileNameChar) !== -1)) {
                fse.copyFileSync(sourceName, targetName);
                if (deleteSourceFile) {
                    fs.unlinkSync(sourceName)
                }
                loopCallback && loopCallback(targetName);
            }
        } else if (stat.isDirectory()) {
            exports.copyFiles(sourceName, targetName, fileNameChar, deleteSourceFile, loopCallback);
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

exports.rmdirSync = (path) => {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                rmdirSync(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}