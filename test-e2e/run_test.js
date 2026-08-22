const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Intercept network requests to log them
  page.on('request', request => {
    if (request.url().includes('/api/auth')) {
      console.log(`\n[NETWORK] ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`[NETWORK-PAYLOAD] ${request.postData()}`);
      }
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/auth')) {
      console.log(`[NETWORK-RESPONSE] ${response.url()} -> ${response.status()}`);
      if (response.url().includes('/api/auth/me')) {
        try {
          const body = await response.json();
          console.log(`[AUTH-ME-DATA] \nuser.id: ${body.data.id}\nuser.role: ${body.data.role}\nproperty.id: ${body.data.propertyId}\nproperty.slug: ${body.data.propertySlug}\nonboardingStatus: ${body.data.onboardingStatus}\nonboardingSessionStatus: ${body.data.onboardingSessionStatus}`);
        } catch (e) {
          console.log(`[AUTH-ME-DATA-ERROR] Could not parse json:`, e.message);
        }
      }
    }
  });

  page.on('console', msg => console.log('[CONSOLE]', msg.text()));

  // Step 1: Open /partner/login
  console.log("Navigating to /partner/login...");
  await page.goto('http://localhost:3000/partner/login', { waitUntil: 'networkidle2' });
  
  await page.type('input[type="email"]', 'Apurav.rural@gmail.com');
  await page.type('input[type="password"]', 'Cattle@123');
  
  console.log("Clicking login...");
  
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);
  
  console.log("Navigation complete. Current URL:", page.url());
  
  const cookies = await page.cookies();
  console.log("[COOKIES]", cookies.map(c => c.name).join(', '));
  
  await page.screenshot({ path: 'login_redirect.png' });
  console.log("Saved login_redirect.png");
  
  // Step 5: Refresh
  console.log("Refreshing page...");
  await page.reload({ waitUntil: 'networkidle2' });
  console.log("After refresh URL:", page.url());
  
  // Step 6: Open /partner/dashboard manually
  console.log("Navigating directly to /partner/dashboard...");
  await page.goto('http://localhost:3000/partner/dashboard', { waitUntil: 'networkidle2' });
  console.log("After manual dashboard navigation URL:", page.url());
  
  await page.screenshot({ path: 'dashboard_redirect.png' });
  console.log("Saved dashboard_redirect.png");

  await browser.close();
  console.log("Done.");
})();
