const { JSDOM } = require('jsdom')
const axios = require('axios');
const { JDdb, JDDetailDB } = require('../../db/db')

// 爬取详情页信息
const getJDDetail = async page => {

    console.log('JD-清空历史数据...')

    await JDDetailDB.remove({}, { multi: true })

    console.log(`JD-读取列表中的商品链接...`)

    const count =  await JDdb.count({})

    const list = await JDdb.find({}) || [];

    console.log('JD-跳转到详情页，正在获取详情页数据...')


    for (let i = 0; i < list.length; i ++ ) {

        console.log(`共${count}条数据，正在查询第${i}条数据...`)
        
        console.log(list[i].url)

        await page.goto(list[i].url ,{ waitUntil: ['load', 'domcontentloaded'], timeout: 0})

        const html = await page.content();

        const htmlDom = new JSDOM(html);

        const dom = htmlDom.window.document

        const detail = await getDetail(page, dom, list[i].url)

        await JDDetailDB.insert(detail)

        console.log(`JD-第${i}条数据存储完成...`)

    }

    console.log('JD-数据爬取完成!')

    await page.close(); 
    openBrowse('http://localhost:9527/export/JD')
}

const getDetail = async (page, dom, url) => {

    let shopName, shopKeeper, sku = [], productName;
    // goodshop
    const shopEL = dom.querySelector('.popbox-inner h3 a')
    if (shopEL) {
        shopName = shopEL.textContent.trim()
    } else {
        shopName = '自营'
    }

    shopKeeper = shopName

    productName = dom.querySelector('.sku-name')

    const skuList = await page.evaluate(() => pageConfig.product.colorSize);

    if (skuList.length) {
        for(let i = 0; i < skuList.length; i++) {
        
            const priceInfo = await axios.get(`https://p.3.cn/prices/mgets?skuIds=J_${skuList[i].skuId}`)
            const spec = []
            const item = skuList[i]
            Object.keys(item).forEach(key => {
                if (key != 'skuId' && key != 'stock')  spec.push(item[key]);
            })
    
            sku.push({
                店铺:shopName,
                掌柜:shopKeeper,
                商品名称: productName,
                规格: spec.join(';'),
                价格: priceInfo.data[0].p,
                详情地址: url
            })
        } 
    } else {
        sku.push({
            店铺:shopName,
            掌柜:shopKeeper,
            商品名称: productName,
            规格: productName,
            价格: dom.querySelector('.summary-price-wrap .p-price .price').textContent.trim(),
            详情地址: url
        })
    }
    return sku

    
}



module.exports = getJDDetail


