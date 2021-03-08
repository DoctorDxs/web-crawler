var XLSXWriter = require('xlsx-writestream');
var fs = require('fs');
const collectionType = process.argv.slice(2)[0];
const { TBDetailDB, JDDetailDB } = require('../../db/db');
const path = require('path')

// 导出excel

const formatTime = _ => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('') + '' + [hour, minute, second].map(formatNumber).join('')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const exportExcel = async (type = collectionType) => {

    let list = (type === 'TB' ? await TBDetailDB.find({}) : await JDDetailDB.find({})) || []

    const fileName = `${type}-${new Date().getTime()}.xlsx`
    console.log(fileName)

    const writer = new XLSXWriter(fileName, {});


    writer.getReadStream().pipe(fs.createWriteStream(fileName))
    
    list.forEach(item => {
        writer.addRow(item)
    })

    writer.finalize();

    console.log('数据已导出。。。')
    fs.appendFileSync(path.resolve(__dirname, './date.txt'), new Date())
}
