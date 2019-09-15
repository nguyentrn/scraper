const puppeteer = require("puppeteer");
const mongoose = require("mongoose");

const username = "aohoa1303@gmail.com";
const password = "13011996";

const DB = "mongodb://localhost:27017/facebook";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
  })
  .then(con => {
    // console.log(con.connections);
    console.log("DB connect successfull !");
  });

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 400);
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const context = browser.defaultBrowserContext();

  const page = await browser.newPage();
  page.setViewport({ width: 1024, height: 720 });
  await page.goto("https://m.facebook.com");
  console.log("Login");
  await page.type("#m_login_email", username);
  await page.type("#m_login_password", password);
  await page.click("button[value='Đăng nhập']");
  await page.waitForNavigation();

  context.clearPermissionOverrides();
  context.overridePermissions("https://facebook.com", ["notifications"]);

  page.on("dialog", dialog => {
    console.log("dialog");
    dialog.accept();
  });

  console.log("Bypass");

  const crawl = [];
  var profiles = ["nguyentrn", "huyentnk"];
  for (let i = 0; i < profiles.length; i++) {
    console.log("-------------Crawling Info1");
    const scrapingProfile = await Profile.findOne({ facebookId: profiles[i] });
    if (!scrapingProfile) {
      console.log("-------------Crawling friends....waiting10seconds");
      // await page.goto(`https://m.facebook.com/${profiles[i]}/friends`);
      // await autoScroll(page);
      // console.log("before waiting");
      // // await delay(10000);
      // console.log("after waiting");
      // const results3 = await page.evaluate(() => {
      //   let friends = document.querySelectorAll("._52jh._5pxc a");

      //   let friendsText = [];
      //   friends.forEach(info =>
      //     friendsText.push({
      //       name: info.innerText,
      //       url: info
      //         .getAttribute("href")
      //         .replace("/", "")
      //         .replace("profile.php?id=", "")
      //     })
      //   );
      //   // let profileHomePage = { other: [] };
      //   // friendsText.forEach(info => {
      //   //   console.log(info);
      //   //   if (info.includes("Chuyển tới")) {
      //   //   }
      //   //   friends.forEach(info => friendsText.push(info.innerText));
      //   //   for (let i = 0; i < lastPostsTimestamp; i++) {
      //   //     console.log(lastPostsTimestamp[i], lastPostsLikes[i]);
      //   //     profileHomePage.lastPostsTimestamp.push(
      //   //       lastPostsTimestamp[i].innerText
      //   //     );
      //   //     profileHomePage.lastPostsLikes.push(lastPostsLikes[i].innerText);
      //   //   }
      //   // });
      //   return friendsText;
      // });

      const newProfile = await Profile.create({ ...results1, ...results2 });
      console.log(newProfile);
      crawl.push(newProfile);
    }
  }
  await page.screenshot({ path: "facebook.png" });

  // await browser.close();
})();
