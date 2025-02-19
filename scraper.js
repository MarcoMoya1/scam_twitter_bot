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
  await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for transition
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

// Function to Like Tweets
async function likeTweets(page, keyword, maxLikes = 5) {
  console.log(`Searching for tweets containing: "${keyword}"`);
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`, { waitUntil: "networkidle2" });

  await new Promise(resolve => setTimeout(resolve, 3000)); // Allow tweets to load

  const likeButtons = await page.$$('div[data-testid="like"]');

  let likeCount = 0;
  for (let button of likeButtons) {
    if (likeCount >= maxLikes) break;
    await button.click();
    console.log(`Liked tweet ${likeCount + 1}`);
    likeCount++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Finished liking ${likeCount} tweets.`);
}
async function retweetTweets(page, keyword, maxRetweets = 5) {
  console.log(`Searching for recent high-engagement tweets containing: "${keyword}"`);
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`, { waitUntil: "networkidle2" });

  await new Promise(resolve => setTimeout(resolve, 3000)); // Allow tweets to load

  const tweets = await page.$$('article');
  let retweetCount = 0;

  for (let tweet of tweets) {
    if (retweetCount >= maxRetweets) break;

    // Get engagement numbers
    const engagement = await tweet.evaluate(node => {
      const stats = node.querySelectorAll('div[data-testid="like"], div[data-testid="retweet"], div[data-testid="reply"]');
      return {
        likes: stats[0] ? parseInt(stats[0].innerText.replace(/\D/g, '')) || 0 : 0,
        retweets: stats[1] ? parseInt(stats[1].innerText.replace(/\D/g, '')) || 0 : 0,
        replies: stats[2] ? parseInt(stats[2].innerText.replace(/\D/g, '')) || 0 : 0
      };
    });

    // Filter for high engagement
    if (engagement.likes >= 20 || engagement.retweets >= 10 || engagement.replies >= 5) {
      const retweetButton = await tweet.$('div[data-testid="retweet"]');
      if (retweetButton) {
        await retweetButton.click();
        await page.waitForSelector('div[data-testid="retweetConfirm"]');
        await page.click('div[data-testid="retweetConfirm"]');
        console.log(`Retweeted a high-engagement tweet: ${engagement.likes} Likes, ${engagement.retweets} Retweets, ${engagement.replies} Replies`);
        retweetCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log(`Finished retweeting ${retweetCount} tweets.`);
}

async function postTweet(page, keyword) {
  console.log(`Searching for latest scam tweets for posting alert...`);
  await page.goto(`https://twitter.com/search?q=${encodeURIComponent(keyword)}&f=live`, { waitUntil: "networkidle2" });

  await new Promise(resolve => setTimeout(resolve, 3000));

  const tweets = await page.$$('article');

  for (let tweet of tweets) {
    // Extract tweet text
    const tweetText = await tweet.evaluate(el => el.innerText);

    // Get engagement numbers
    const engagement = await tweet.evaluate(node => {
      const stats = node.querySelectorAll('div[data-testid="like"], div[data-testid="retweet"], div[data-testid="reply"]');
      return {
        likes: stats[0] ? parseInt(stats[0].innerText.replace(/\D/g, '')) || 0 : 0,
        retweets: stats[1] ? parseInt(stats[1].innerText.replace(/\D/g, '')) || 0 : 0,
        replies: stats[2] ? parseInt(stats[2].innerText.replace(/\D/g, '')) || 0 : 0
      };
    });

    // Only tweet about high-engagement scam posts
    if (engagement.likes >= 50 || engagement.retweets >= 20) {
      console.log("Found a high-engagement scam tweet, posting an alert...");

      await page.goto("https://twitter.com/home", { waitUntil: "networkidle2" });

      await page.waitForSelector('div[data-testid="tweetTextarea_0"]');
      await page.click('div[data-testid="tweetTextarea_0"]');

      const alertMessage = `🚨 SCAM ALERT! 🚨  
"${tweetText.substring(0, 200)}..."  
Trending with ${engagement.likes} Likes, ${engagement.retweets} Retweets.  
Stay safe! #CryptoScam #ScamAlert`;

      await page.keyboard.type(alertMessage, { delay: 50 });

      await page.waitForSelector('div[data-testid="tweetButton"]');
      await page.click('div[data-testid="tweetButton"]');

      console.log("Scam alert tweet posted successfully!");
      break;
    }
  }
}


module.exports = { loginTwitter, likeTweets, retweetTweets, postTweet };
