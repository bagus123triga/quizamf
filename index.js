const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");
const port = process.env.PORT || 4000;

async function getResult(url) {
  const browser = await puppeteer.launch({
    headless: chrome.headless,
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath,
    args: chrome.args,
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitForSelector("#main > div > button.button.primary.full-width");
  await page.click("#main > div > button.button.primary.full-width");
  await page.waitForSelector("#main > div > div > div > img");

  let image = await page.$eval("#main > div > div > div > img", (element) => {
    return element.getAttribute("src");
  });

  await page.waitForSelector("#main > div > div > button:nth-child(2)");

  const imagenya = `${url}${image}`;
  const jawabannya = image.replace("_small.gif", "");

  console.log(`Image : ${imagenya}`);
  console.log(`Jawaban : ${jawabannya}`);

  await browser.close();

  return {imagenya, jawabannya};
}

const app = express();

app.use(cors());

app.listen(port, () => {
  console.log(`Server Sedang Berjalan Di Port ${port}`);
});

app.get("/logoquiz", async (req, res) => {
  const url = "https://logoquiz.net/"; // Ganti dengan URL yang diinginkan
  const gets = await getResult(url);
  res.json(gets);
});
