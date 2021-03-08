const getJDDetail = require('./detail')

const { JDdb } = require('../../db/db')

//京东搜索  输入搜索关键字并搜索
const JDSearch = async (page, config, detail) => {

    console.log('JD-清空历史数据...')

    !detail &&  await JDdb.remove({}, { multi: true })

    console.log('JD-填入关键字，开始搜索...')

    await page.type('#key', config.key);

    await page.waitForSelector('.button');

    await page.click('.button')

    detail ? getJDDetail(page) : getList(page, 1, config.num)    
};

// 抓取商品列表
const getList = async (page, pageNum, totalPage) => {

    console.log(`JD-正在获取第${pageNum}页列表商品链接...`)

    await page.waitForSelector('.p-name')

    await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight) })

    await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight) })

    await page.waitFor(800)

    const list = await page.$$eval('.gl-item .p-name a', el => el.map(item => item.href))

    saveList(page, list, pageNum, totalPage)
}

// 下一页列表数据
const nextList = async (page, totalPage) => {

    const pageNum = await page.$eval('.p-num .curr', el => el.textContent.trim())

    console.log(`JD-正在查询第${pageNum}页列表...`)

    const next = await page.$('.pn-next')

    const disabled = await page.$('.pn-next.disabled')

    if (next && !disabled && totalPage > pageNum) {

        await next.click(`SEARCH.page(${pageNum * 2 -1}, true)`)

        getList(page, pageNum, totalPage)

    } else {

        console.log('JD-查询完毕，开始获取详情页数据...')

        getJDDetail(page)

    }
    
}

// 存储数据
const saveList = async (page, list, pageNum, totalPage) => {

    console.log(`JD-正在存储第${pageNum}页列表数据...`)

    const data = list.map(url => {return {url: url}})

    await JDdb.insert(data)

    console.log(`JD-第${pageNum}页列表数据存储完成...`)

    nextList(page, totalPage);
}


module.exports = JDSearch




