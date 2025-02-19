const { loginTwitter, likeTweets, retweetTweets, postTweet } = require("./scraper");

(async () => {
  const { browser, page } = await loginTwitter();

  await likeTweets(page, "crypto scam OR crypto fraud OR rug pull", 3); // Likes scam-related tweets with high engagement
  await retweetTweets(page, "crypto scam OR fake airdrop OR phishing", 2); // Retweets high-engagement scam alerts
  await postTweet(page, "crypto scam OR fake airdrop OR crypto fraud"); // Posts a scam alert based on recent trends

  console.log("All actions completed.");
  await browser.close();
})();
