const { webkit } = require('playwright');

(async () => {
  console.log("Starting Playwright WebKit...");
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('response', response => {
    if (response.url().includes('/api/partner/onboarding/session')) {
      console.log('<<', response.status(), response.url());
    }
  });

  const timestamp = Date.now();
  const userAEmail = `usera_${timestamp}@example.com`;
  const userBEmail = `userb_${timestamp}@example.com`;

  try {
    // 1. Register User A
    console.log("Registering User A...");
    await page.goto('http://localhost:3001/partner/register');
    await page.fill('input[placeholder="Your Name"]', 'User A');
    await page.fill('input[placeholder="owner@hotel.com"]', userAEmail);
    await page.fill('input[placeholder="9876543210"]', '1111111111');
    await page.fill('input[placeholder="e.g. Royal Shivay Retreat"]', 'Property A');
    
    const passwords = await page.locator('input[placeholder="••••••••"]').all();
    await passwords[0].fill('Password@123');
    await passwords[1].fill('Password@123');
    await page.check('input[type="checkbox"]');
    
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(4000);
    
    const errorText = await page.locator('.text-\\[\\#F24633\\]').count() > 0 ? await page.locator('.text-\\[\\#F24633\\]').textContent() : null;
    if (errorText) {
      console.log("REGISTRATION ERROR:", errorText);
      throw new Error("Registration blocked by application logic");
    }

    console.log("User A registered. URL:", page.url());

    // 2. Initial state User A
    await page.goto('http://localhost:3001/partner/onboarding/property');
    // Save a value
    console.log("Saving onboarding data for User A...");
    
    const titlePlaceholder = 'input[placeholder="e.g. Grand Shivay Resort & Spa"]';
    await page.waitForSelector(titlePlaceholder, { timeout: 5000 });
    await page.fill(titlePlaceholder, 'USER_A_PROPERTY_TITLE');
    
    // Wait for debounce save (assumed ~1-2s)
    await page.waitForTimeout(6000);

    // 3. Logout User A
    console.log("Logging out User A...");
    await page.evaluate(async () => {
       await fetch('/api/auth/logout', { method: 'POST' });
    });
    await page.goto('http://localhost:3001/partner/register');
    await page.waitForTimeout(1000);

    // 4. Register User B
    console.log("Registering User B...");
    await page.fill('input[placeholder="Your Name"]', 'User B');
    await page.fill('input[placeholder="owner@hotel.com"]', userBEmail);
    await page.fill('input[placeholder="9876543210"]', '2222222222');
    await page.fill('input[placeholder="e.g. Royal Shivay Retreat"]', 'Property B');
    
    const passwords2 = await page.locator('input[placeholder="••••••••"]').all();
    await passwords2[0].fill('Password@123');
    await passwords2[1].fill('Password@123');
    await page.check('input[type="checkbox"]');
    
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(4000);
    console.log("User B registered. URL:", page.url());

    // 5. Initial state User B / B->A Isolation
    console.log("Checking User B isolation state...");
    await page.goto('http://localhost:3001/partner/onboarding/property');
    await page.waitForSelector(titlePlaceholder, { timeout: 5000 });
    
    const titleB = await page.inputValue(titlePlaceholder);
    if (titleB === 'USER_A_PROPERTY_TITLE') {
      console.log("FAIL: B -> A DATA ISOLATION FAILED. User B sees User A's data!");
    } else {
      console.log(`PASS: User B sees clean state. (Title: "${titleB}")`);
    }

    // Check LocalStorage keys for B
    const lsKeysB = await page.evaluate(() => Object.keys(localStorage));
    console.log("User B LocalStorage keys:", lsKeysB);

    // 6. Logout User B
    console.log("Logging out User B...");
    await page.evaluate(async () => {
       await fetch('/api/auth/logout', { method: 'POST' });
    });

    // 7. Login User A
    console.log("Logging in User A again...");
    await page.goto('http://localhost:3001/partner/login');
    await page.fill('input[type="email"]', userAEmail);
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(4000);

    // 8. Verify User A data / A->B Isolation
    console.log("Checking User A restored state...");
    await page.goto('http://localhost:3001/partner/onboarding/property');
    await page.waitForSelector(titlePlaceholder, { timeout: 5000 });
    
    const titleA = await page.inputValue(titlePlaceholder);
    if (titleA === 'USER_A_PROPERTY_TITLE') {
      console.log("PASS: User A data is properly restored.");
    } else {
      console.log(`FAIL: User A data was lost. (Title: "${titleA}")`);
    }

    // Check LocalStorage keys for A
    const lsKeysA = await page.evaluate(() => Object.keys(localStorage));
    console.log("User A LocalStorage keys:", lsKeysA);
    
    console.log("E2E ISOLATION TEST COMPLETED");

  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await browser.close();
  }
})();
