const puppeteer = require("puppeteer");
const { TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_URL } = require("./config");

async function loginTwitter() {
  const browser = await puppeteer.launch({ headless: false, args: ["--start-maximized"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Opening Twitter login page...");
  await page.goto(TWITTER_URL, { waitUntil: "networkidle2" });

  // Wait for username field and enter username
  await page.waitForSelector('input[autocomplete="username"], input[name="text"]', { timeout: 10000 });
  await page.type('input[autocomplete="username"], input[name="text"]', TWITTER_USERNAME);
  console.log("Entered username...");

  // Press Enter instead of clicking "Next"
  await page.keyboard.press('Enter');
  console.log("Pressed Enter...");

  // Use an alternative wait method (replace page.waitForTimeout)
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for transition

  // Wait for the password field to appear
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  console.log("Password field detected...");

  // Enter password
  await page.type('input[name="password"]', TWITTER_PASSWORD);
  console.log("Entered password...");

  // Press Enter to submit login
  await page.keyboard.press('Enter');
  console.log("Pressed Enter for login...");

  // Wait for successful login with an increased timeout
  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }); // 60s timeout
    console.log("Successfully logged into Twitter!");
  } catch (error) {
    console.error("Login might have failed or needs verification. Check browser manually.");
  }

  return { browser, page };
}

module.exports = { loginTwitter };
