const Koa=require('koa');
const views = require('koa-views');
const openBrowse = require('./untils/openBrowse')
const router = require('koa-router')()
const app  = new Koa()
const bodyParser = require('koa-bodyparser')

const crawlerStart = require('./crawler/start')

app.use(views(__dirname + '/views', {
    map : {html:'ejs'}
}));

app.use(bodyParser())


router.get('/', async ctx => {
    await ctx.render('index')
})

router.post('/start', async ctx => {
    const config = ctx.request.body
    const type = config.type
    type.forEach(item => {
        crawlerStart({type: item,key: config.key, num: config.num})
    })
    ctx.body = {
        message: '开始查询',
        state: 1
    }
})



router.get('/result', async ctx => {
    await ctx.render('export')
})

router.post('/export/JD', async ctx => {
    await ctx.render('export')
})

router.post('/export/TB', async ctx => {
    await ctx.render('export')
})


app.use(router.routes()).use(router.allowedMethods()); //启动路由

app.listen(9527);

openBrowse('http://localhost:9527')
console.log("服务器已启动，http://localhost:9527");
