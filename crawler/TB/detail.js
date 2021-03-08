const { JSDOM } = require('jsdom')

const { TBdb, TBDetailDB } = require('../../db/db')
const openBrowse = require('../../untils/openBrowse')

// 爬取详情页信息
const getTBDetail = async page => {

    console.log('TB-清空历史数据...')

    await TBDetailDB.remove({}, { multi: true })
    
    console.log(`TB-读取列表中的商品链接...`)

    const list = await TBdb.find({}) || [];


    const count =  await TBdb.count({})

    console.log('TB-跳转到详情页，正在获取详情页数据...')


    for (let i = 0; i < list.length; i ++ ) {

        console.log(`共${count}条数据，正在查询第${i}条数据...`)
        console.log(list[i].url)
        await page.goto(list[i].url, { waitUntil: ['load', 'domcontentloaded'], timeout: 0})
        
        // 淘宝有3中不同类型的商品详情？？？？？

        const html = await page.content();

        const htmlDom = new JSDOM(html);

        const dom = htmlDom.window.document

        const TMShop = dom.querySelector('.slogo-shopname')

        const TBShop = dom.querySelector('.tb-shop-name')

        const TBCompanyShop = dom.querySelector('.shop-name-link')

        let detail = {}

        if (TMShop) {

            detail =  await getTMShop(page, html, dom, list[i].url)

        } else if (TBShop) {

            detail = await getTBDSop(page, html, dom, list[i].url)

            detail.detailUrl = list[i].url

        } else if (TBCompanyShop){
            detail = await getTBCompanyShop(page, html, dom, list[i].url)

        }


        await TBDetailDB.insert(detail)

        console.log(`TB-第${i}条数据存储完成...`)

        

    }

    console.log('TB-数据爬取完成!')

    await page.close();

    openBrowse('http://localhost:9527/export/TB')
}

// 获取天猫详情
const getTMShop = async (page, html, dom, url) => {

    let shopName, shopKeeper, sku = [], productName;

    const shopInfoHtml = dom.querySelector('.ks-datalazyload').value;

    const dom2 = new JSDOM(shopInfoHtml);

    shopKeeper = dom2.window.document.querySelector(".shopkeeper a").textContent.trim();

    shopName = dom.querySelector('.slogo-shopname').textContent.trim();

    let productNameClassA = dom.querySelector('.tm-detail-meta .tb-detail-hd a');

    let productNameClassB = dom.querySelector('.tm-detail-meta .tb-detail-hd h1');

    if (productNameClassA) {

        productName = dom.querySelector('.tm-detail-meta .tb-detail-hd a').textContent.trim();

    } else if (productNameClassB) {

        productName = dom.querySelector('.tm-detail-meta .tb-detail-hd h1').textContent.trim();

    }
    
    // WTF 一个正则搞了我一晚上
    const skuInfo = html.match(/TShop\.Setup\(\s(.*)\s/);

    if(skuInfo[1]) {
        const valItemInfo = JSON.parse(skuInfo[1]) || {};

        const skuMap = valItemInfo.valItemInfo.skuMap;
        
        const skuList = valItemInfo.valItemInfo.skuList;
        if (skuMap && skuList) {
            for(let key in skuMap) {
                for (let i = 0; i < skuList.length; i ++ ) {
                    if (skuMap[key].skuId == skuList[i].skuId) {
                        sku.push({
                            店铺:shopName,
                            掌柜:shopKeeper,
                            商品名称: productName,
                            规格: skuList[i].names,
                            价格: skuMap[key].price,
                            详情地址: url,
                        })
                    }
                }
            }
        } else {
            sku.push({
                店铺:shopName,
                掌柜:shopKeeper,
                商品名称: productName,
                规格: productName,
                价格: dom.querySelector('.tm-price').textContent.trim(),
                详情地址: url,
            })
        }

        
    };

    return sku
    
}

// 获取淘宝详情
const getTBDSop = async (page, html, dom, url) => {

    let shopName, shopKeeper, sku = [], productName;

    productName =  dom.querySelector('.tb-main-title').textContent.trim()

    shopName = dom.querySelector('.tb-shop-name').textContent.trim();

    shopKeeper = dom.querySelector('.tb-seller-name').textContent.trim();

    sku = await skuMapHandle(page, sku, dom, shopName, shopKeeper,productName, url)

    return sku

}



// 获取淘宝企业详情
const getTBCompanyShop = async (page, html, dom, url) => {

    let shopName, shopKeeper, sku = [], productName;

    productName =  dom.querySelector('.tb-main-title').textContent.trim()

    shopName = dom.querySelector('.shop-name-link').textContent.trim();

    shopKeeper = dom.querySelectorAll('.summary-popup .info-item')[1].textContent.trim();

    sku = await skuMapHandle(page, sku, dom, shopName, shopKeeper,productName, url)
    

    return sku
}

// 处理淘宝 skuMap

const skuMapHandle = async (page, sku, dom, shopName, shopKeeper,productName, url) => {

    const skuInfo = await page.evaluate(() => Hub.config.get('sku'));

    const skuMap = skuInfo.valItemInfo.skuMap;

    // 先删除 无用的sku

    for (let key in skuMap) {
        let skuKey = key
        let keys = key.split(';')
        for(let i = 0; i < key.length; i++) {
            if (keys[i]) {
                const skuEl = dom.querySelector(`[data-value='${keys[i]}'] a`)
                if(!skuEl) delete skuMap[skuKey]
            }
        }
    }

    for (let key in skuMap) {
        let skuKey = key
        let keys = key.split(';')
        for(let i = 0; i < key.length; i++) {
            if (keys[i]) {
                const skuEl = dom.querySelector(`[data-value='${keys[i]}'] a`)
                if (skuEl) {
                    const skuName =  skuEl.textContent.trim()
                    skuKey = skuKey.replace(keys[i], skuName)
                } 
            }
        }
        sku.push({
            店铺:shopName,
            掌柜:shopKeeper,
            商品名称: productName,
            规格: skuKey,
            价格: skuMap[key].price,
            详情地址: url
        })
    }

    return sku
}





module.exports = getTBDetail


