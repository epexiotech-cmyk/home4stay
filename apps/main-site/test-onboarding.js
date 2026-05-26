
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to /partner/onboarding/theme...');
  await page.goto('http://localhost:3000/partner/onboarding/theme', { waitUntil: 'networkidle0' });
  
  console.log('Clicking Continue Setup...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Continue Setup'));
    if (btn) btn.click();
  });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  const url = page.url();
  console.log('Current URL after click:', url);
  
  await browser.close();
})();

