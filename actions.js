async function likeTweet(page, tweetURL) {
    await page.goto(tweetURL, { waitUntil: "networkidle2" });
    await page.waitForSelector('div[data-testid="like"]');
    await page.click('div[data-testid="like"]');
    console.log("Liked tweet:", tweetURL);
  }
  
  async function retweet(page, tweetURL) {
    await page.goto(tweetURL, { waitUntil: "networkidle2" });
    await page.waitForSelector('div[data-testid="retweet"]');
    await page.click('div[data-testid="retweet"]');
    console.log("Retweeted:", tweetURL);
  }
  
  async function postTweet(page, message) {
    await page.goto("https://twitter.com/compose/tweet", { waitUntil: "networkidle2" });
    await page.type('div[aria-label="Tweet text"]', message, { delay: 50 });
    await page.click('div[data-testid="tweetButtonInline"]');
    console.log("Tweeted:", message);
  }
  
  module.exports = { likeTweet, retweet, postTweet };
  