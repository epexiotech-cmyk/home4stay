import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('/api/') || status >= 300) {
      console.log(`[NETWORK] ${status} ${url}`);
    }
  });

  console.log('Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', 'super_admin@home4stay.homes');
  await page.type('input[type="password"]', 'Admin123!');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  
  console.log('Currently at:', page.url());
  
  console.log('Clicking Database link...');
  
  await page.goto('http://localhost:3000/admin/database', { waitUntil: 'networkidle0' });

  console.log('Final URL after Database click:', page.url());
  
  await browser.close();
})();
