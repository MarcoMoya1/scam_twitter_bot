const cron = require("node-cron");
const { loginTwitter } = require("./scraper");
const { likeTweet, retweet, postTweet } = require("./actions");

(async () => {
  const { browser, page } = await loginTwitter();

  // Like tweets on schedule (Every 15 minutes)
  cron.schedule("*/15 * * * *", async () => {
    console.log("Liking a tweet...");
    await likeTweet(page, "https://twitter.com/someone/status/123456789");
  });

  // Retweet on schedule (Every 30 minutes)
  cron.schedule("*/30 * * * *", async () => {
    console.log("Retweeting...");
    await retweet(page, "https://twitter.com/someone/status/123456789");
  });

  // Tweet a scam alert daily at 10 AM
  cron.schedule("0 10 * * *", async () => {
    console.log("Posting scam alert...");
    await postTweet(page, "🚨 Warning! New scam detected in the crypto space. Stay safe! #CryptoScam");
  });
})();
