const { loginTwitter, likeTweets, retweetTweets, postTweet } = require("./scraper");

(async () => {
  const { browser, page } = await loginTwitter();

  await likeTweets(page, "crypto scam OR crypto fraud OR rug pull", 3); // Like tweets after scrolling & filtering
  await retweetTweets(page, "crypto scam OR fake airdrop OR phishing", 2); // Retweet tweets after scrolling & filtering
  await postTweet(page, "crypto scam OR fake airdrop OR crypto fraud"); // Post about trending scams

  console.log("✅ All actions completed.");
  await browser.close();
})();
