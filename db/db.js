const datastore = require('nedb-promise') 

const path = require('path')


const TBdb = datastore({
    filename: path.resolve(__dirname, './TB/list.db'),
    autoload: true // so that we don't have to call loadDatabase()
})

const TBDetailDB = datastore({
    filename: path.resolve(__dirname, './TB/detail.db'),
    autoload: true // so that we don't have to call loadDatabase()
})

const JDdb = datastore({
    filename: path.resolve(__dirname, './JD/list.db'),
    autoload: true // so that we don't have to call loadDatabase()
})

const JDDetailDB = datastore({
    filename: path.resolve(__dirname, './JD/detail.db'),
    autoload: true // so that we don't have to call loadDatabase()
})

module.exports = {
    TBdb,
    TBDetailDB,
    JDdb,
    JDDetailDB
}

