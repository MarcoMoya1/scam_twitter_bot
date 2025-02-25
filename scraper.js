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

  // Wait for password field
  await new Promise(resolve => setTimeout(resolve, 3000)); // Give time for UI transition
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  console.log("Password field detected...");

  // Clear any pre-filled password (if any) and enter password
  await page.click('input[name="password"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[name="password"]', TWITTER_PASSWORD, { delay: 100 });
  console.log("Entered password...");

  // Press Enter to submit login
  await page.keyboard.press('Enter');
  console.log("Pressed Enter for login...");

  // Wait for successful login
  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    console.log("Successfully logged into Twitter!");
  } catch (error) {
    console.error("Login might have failed or needs verification. Check browser manually.");
  }

  return { browser, page };
}

// Function to Like Tweets (with scrolling and filtering)
async function likeTweets(page, keyword, maxLikes = 5) {
  console.log(`🔍 Searching for tweets containing: "${keyword}"`);
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`, { waitUntil: "networkidle2" });

  let likeCount = 0;
  let scrollAttempts = 0;

  while (likeCount < maxLikes && scrollAttempts < 5) { // Scroll max 5 times
    const tweets = await page.$$('article');

    for (let tweet of tweets) {
      if (likeCount >= maxLikes) break;

      const engagement = await tweet.evaluate(node => {
        const stats = node.querySelectorAll('div[data-testid="like"], div[data-testid="retweet"], div[data-testid="reply"]');
        return {
          likes: stats[0] ? parseInt(stats[0].innerText.replace(/\D/g, '')) || 0 : 0,
          retweets: stats[1] ? parseInt(stats[1].innerText.replace(/\D/g, '')) || 0 : 0,
          replies: stats[2] ? parseInt(stats[2].innerText.replace(/\D/g, '')) || 0 : 0
        };
      });

      if (engagement.likes >= 20 || engagement.retweets >= 10 || engagement.replies >= 5) {
        const likeButton = await tweet.$('div[data-testid="like"]');
        if (likeButton) {
          await likeButton.click();
          console.log(`👍 Liked a tweet with ${engagement.likes} Likes, ${engagement.retweets} Retweets, ${engagement.replies} Replies`);
          likeCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (likeCount < maxLikes) {
      console.log("📜 Scrolling down for more tweets...");
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(resolve => setTimeout(resolve, 3000)); // Scroll delay
      scrollAttempts++;
    }
  }

  console.log(`✅ Finished liking ${likeCount} tweets.`);
}

// Function to Retweet Tweets (with scrolling and filtering)
async function retweetTweets(page, keyword, maxRetweets = 5) {
  console.log(`🔍 Searching for tweets containing: "${keyword}"`);
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`, { waitUntil: "networkidle2" });

  let retweetCount = 0;
  let scrollAttempts = 0;

  while (retweetCount < maxRetweets && scrollAttempts < 5) {
    const tweets = await page.$$('article');

    for (let tweet of tweets) {
      if (retweetCount >= maxRetweets) break;

      const engagement = await tweet.evaluate(node => {
        const stats = node.querySelectorAll('div[data-testid="like"], div[data-testid="retweet"], div[data-testid="reply"]');
        return {
          likes: stats[0] ? parseInt(stats[0].innerText.replace(/\D/g, '')) || 0 : 0,
          retweets: stats[1] ? parseInt(stats[1].innerText.replace(/\D/g, '')) || 0 : 0,
          replies: stats[2] ? parseInt(stats[2].innerText.replace(/\D/g, '')) || 0 : 0
        };
      });

      if (engagement.likes >= 20 || engagement.retweets >= 10 || engagement.replies >= 5) {
        const retweetButton = await tweet.$('div[data-testid="retweet"]');
        if (retweetButton) {
          await retweetButton.click();
          await page.waitForSelector('div[data-testid="retweetConfirm"]');
          await page.click('div[data-testid="retweetConfirm"]');
          console.log(`🔁 Retweeted a tweet with ${engagement.likes} Likes, ${engagement.retweets} Retweets, ${engagement.replies} Replies`);
          retweetCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (retweetCount < maxRetweets) {
      console.log("📜 Scrolling down for more tweets...");
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(resolve => setTimeout(resolve, 3000)); // Scroll delay
      scrollAttempts++;
    }
  }

  console.log(`✅ Finished retweeting ${retweetCount} tweets.`);
}

// Function to Post a Tweet
async function postTweet(page, tweetText) {
  console.log("📝 Posting a scam alert tweet...");
  await page.goto("https://twitter.com/home", { waitUntil: "networkidle2" });

  await page.waitForSelector('div[data-testid="tweetTextarea_0"]');
  await page.click('div[data-testid="tweetTextarea_0"]');
  await page.keyboard.type(tweetText, { delay: 50 });

  await page.waitForSelector('div[data-testid="tweetButton"]');
  await page.click('div[data-testid="tweetButton"]');

  console.log("✅ Scam alert tweet posted successfully!");
}

module.exports = { loginTwitter, likeTweets, retweetTweets, postTweet };
