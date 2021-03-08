const getTBDetail = require('./detail')

const { TBdb } = require('../../db/db')

//淘宝搜索  输入搜索关键字并搜索
const TBSearch = async (page, config, detail) => {

    console.log('TB-清空历史数据...')

    !detail &&  await TBdb.remove({}, { multi: true })

    console.log('TB-填入关键字，开始搜索...')

    await page.type('#q', config.key);

    await page.waitForSelector('.btn-search');

    await page.click('.btn-search')

    detail ? getTBDetail(page) : getList(page, 1, config.num) 

       
};

// 抓取商品列表
const getList = async (page, pageNum, totalPage) => {

    console.log(`TB-正在获取第${pageNum}页列表商品链接...`)

    const list = await page.$$eval('.pic-link', el => el.map(item => item.href))

    saveList(page, list, pageNum, totalPage)
}

// 下一页列表数据
const nextList = async (page, totalPage) => {
    
    const pageNum = await page.$eval('.m-page .active .num', el => el.textContent.trim())

    console.log(`TB-正在查询第${pageNum}页列表...`)

    const next = await page.$('.icon-btn-next-2')

    if (next && totalPage > pageNum) {

        await next.click()

        getList(page, pageNum, totalPage)

    } else {

        console.log('TB-查询完毕，开始获取详情页数据...')

        getTBDetail(page)

    }
    
}

// 存储数据
const saveList = async (page, list, pageNum, totalPage) => {

    console.log(`TB-正在存储第${pageNum}页列表数据...`)

    const data = list.map(url => {return {url: url}})

    await TBdb.insert(data)

    console.log(`TB-第${pageNum}页列表数据存储完成...`)
    
    nextList(page, totalPage);

}



module.exports = TBSearch



