const cron = require("node-cron");
const { loginTwitter, likeTweets, retweetTweets, postTweet } = require("./scraper");

async function runBot() {
  console.log("🔄 Running Twitter bot...");
  const { browser, page } = await loginTwitter();

  await likeTweets(page, "crypto scam OR crypto fraud OR rug pull", 3);
  await retweetTweets(page, "crypto scam OR fake airdrop OR phishing", 2);
  await postTweet(page, "crypto scam OR fake airdrop OR crypto fraud");

  console.log("✅ Bot actions completed. Waiting for next scheduled run.");
  await browser.close();
}

// Schedule the bot to run every hour
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Running scheduled bot task...");
  await runBot();
});

// Run once immediately when the script starts
runBot();
