const puppeteer = require("puppeteer");
const { TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_URL } = require("./config");

async function loginTwitter() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(TWITTER_URL, { waitUntil: "networkidle2" });

  console.log("Navigated to Twitter login page...");

  // Wait for username field and enter the username
  await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
  await page.type('input[autocomplete="username"]', TWITTER_USERNAME);
  console.log("Entered username...");

  // Find and click the "Next" button
  await page.waitForSelector('div[role="button"]', { timeout: 10000 });
  const buttons = await page.$$('div[role="button"]');

  if (buttons.length < 2) {
    throw new Error("Next button not found");
  }

  await buttons[1].click(); // Click the second button (Next)
  await page.waitForTimeout(2000); // Allow password field to load

  // Wait for password field and enter the password
  await page.waitForSelector('input[name="password"]', { timeout: 10000 });
  await page.type('input[name="password"]', TWITTER_PASSWORD);
  console.log("Entered password...");

  // Find and click the "Login" button
  await page.waitForSelector('div[role="button"]', { timeout: 10000 });
  const loginButtons = await page.$$('div[role="button"]');
  
  await loginButtons[1].click(); // Click login button
  console.log("Clicked Login...");

  // Wait for successful login
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Successfully logged into Twitter!");

  return { browser, page };
}

module.exports = { loginTwitter };
