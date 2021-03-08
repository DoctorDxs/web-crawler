const chromePaths = require('chrome-paths');
const puppeteer = require('puppeteer');
const TBSearch = require('./TB/index');
const JDSearch = require('./JD/index');
const fs = require('fs')

const path = require('path')

fs.writeFileSync(path.resolve(__dirname, './date.txt'), new Date() + '\n')


// 初始化
const start = async config => {
    const type = config.type
    // 初始化浏览器
    const browser = await puppeteer.launch({
        headless: type === 'TB' ?  false : true, //使无头浏览器可见，便于开发过程中观察
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox', 
            '--start-maximized', 
            '--disable-infobars', 
            '--mute-audio',
            '--enable-automation',
            '--disable-webgl',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--allow-running-insecure-content',
            '--disable-popup-blocking',
            "--disable-background-timer-throttling",
            "--disable-client-side-phishing-detection",
            '--disable-translate',
            '--disable-bundled-ppapi-flash',

        ],
        executablePath: chromePaths.chrome,
        userDataDir: path.resolve(__dirname, './user-data'),
        defaultViewport: {
            width: 1290,
            height: 900
        },
        slowMo: 250,
        handleSIGTERM: false,
        handleSIGHUP: false,
        devtools: false, // 打开开发者工具
        handleSIGINT: false
    });


    
    // // 只启动一个  npm run TB 或 npm run JD
    const page = await browser.newPage(); 
    await avoidDetection(page);
    let url = type === 'TB' ? 'https://www.taobao.com' : 'https://www.jd.com'
    await page.goto(url, {waitUntil: ['load', 'domcontentloaded'], timeout: 0});
    switch (type){
        case 'TB':
            TBSearch(page, config)
            break;
        case 'JD':
            JDSearch(page, config)
            break;
        case 'TBDetail':
            TBSearch(page, config, 1)
            break;
        case 'JDDetail':
            JDSearch(page, config, 1)
            break;
        default:
            break;
    }
}

// 防反爬
const avoidDetection = async page => {
    await page.evaluateOnNewDocument(() => {
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        window.navigator.__defineGetter__('userAgent', function() {
            window.navigator.sniffed = true;
            return userAgent;
        });
        window.navigator.__defineGetter__('platform', function() {
            window.navigator.sniffed = true;
            return platform;
        });
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                {
                    0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
                    description: "Portable Document Format",
                    filename: "internal-pdf-viewer",
                    length: 1,
                    name: "Chrome PDF Plugin"
                },
                {
                    0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
                    description: "",
                    filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                    length: 1,
                    name: "Chrome PDF Viewer"
                },
                {
                    0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: Plugin},
                    1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: Plugin},
                    description: "",
                    filename: "internal-nacl-plugin",
                    length: 2,
                    name: "Native Client"
                }
            ],
        });
        window.navigator.chrome = {
            runtime: {},
            loadTimes: function() {},
            csi: function() {},
            app: {}
        };
        window.navigator.language = {
            runtime: {},
            loadTimes: function() {},
            csi: function() {},
            app: {}
        };
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36')


};


module.exports = start


