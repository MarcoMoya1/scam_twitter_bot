const puppeteer = require("puppeteer");
const { TWITTER_USERNAME, TWITTER_PASSWORD, TWITTER_URL } = require("./config");

async function loginTwitter() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(TWITTER_URL, { waitUntil: "networkidle2" });

  // Login form interaction
  await page.type('input[name="session[username_or_email]"]', TWITTER_USERNAME, { delay: 50 });
  await page.type('input[name="session[password]"]', TWITTER_PASSWORD, { delay: 50 });
  await page.click('div[data-testid="LoginForm_Login_Button"]');
  await page.waitForNavigation();

  console.log("Logged in successfully.");
  return { browser, page };
}

module.exports = { loginTwitter };
