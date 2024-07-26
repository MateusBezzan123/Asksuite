const BrowserService = require('../services/BrowserService');

const searchController = {
    search: async (req, res) => {
        const { checkin, checkout } = req.body;

        if (!checkin || !checkout) {
            return res.status(400).send({ error: "Checkin and checkout dates are required" });
        }

        const url = `https://pratagy.letsbook.com.br/reserva/selecao-de-quartos?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&numeroAdultos=2&criancas&codigoHotel=12&codigoCidade&promocode=&device=Mobile&idioma=pt-BR&moeda=BRL&emailHospede&consumer`;

        let browser;
        try {
            browser = await BrowserService.getBrowser();
            const page = await browser.newPage();
            console.log(`Navigating to URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2' });

            await page.waitForTimeout(5000);

            await page.screenshot({ path: 'screenshot.png', fullPage: true });

            const rooms = await page.evaluate(() => {
                const roomElements = document.querySelectorAll('.room-option-wrapper');
                if (!roomElements.length) {
                    console.error('No rooms found');
                    return [];
                }
                
                return Array.from(roomElements).map(room => {
                    const nome = room.querySelector('.room-option-title span')?.innerText || 'No name';
                    const description = room.querySelector('.room-option-title p')?.title || 'No description';
                    const preçoElement = room.querySelector('.daily-price--total .term__highlight');
                    const preço = preçoElement ? `R$ ${preçoElement.innerText.replace(/\s+/g, '').replace('R$', '')}` : 'No price';
                    const imagemElement = room.querySelector('.q-carousel__slide');
                    const imagem = imagemElement ? imagemElement.style.backgroundImage.replace('url("', '').replace('")', '') : 'No image';
                    return { nome, description, preço, imagem };
                });
            });

            console.log(`Rooms found: ${JSON.stringify(rooms)}`);

            await BrowserService.closeBrowser(browser);
            return res.status(200).send(rooms);

        } catch (error) {
            console.error('Error during scraping:', error);
            if (browser) await BrowserService.closeBrowser(browser);
            return res.status(500).send({ error: "Error retrieving room information" });
        }
    }
};

module.exports = searchController;
