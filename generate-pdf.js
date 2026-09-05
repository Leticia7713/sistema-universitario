const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/walkthrough.html', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
    });

    const outputPath = path.join('C:', 'Users', 'Jesus é lindo', 'Downloads', 'walkthrough.pdf');

    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    console.log('PDF gerado com sucesso em:', outputPath);
    await browser.close();
})();
