const fs = require('fs')
const path = require('path')
exports.clearDir = dirName => {
    fs.readdirSync(dirName).forEach(fileName => {
        const fullName = path.join(dirName, fileName);
        const stat = fs.statSync(fullName)
        if (stat.isFile) {
            fs.unlinkSync(fullName)
        } else if (stat.isDirectory) {
            clearDir(fullName);
        }
    })
}