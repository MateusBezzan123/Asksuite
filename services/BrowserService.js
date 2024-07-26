const puppeteer = require('puppeteer');

class BrowserService {
    static async getBrowser() {
        return puppeteer.launch({ headless: true });
    }

    static async closeBrowser(browser) {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = BrowserService;
