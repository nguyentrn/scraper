const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const helper = require("./helpers");
const Profile = require("./model/profile");

const username = "hcmftu2@gmail.com";
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
    console.log("DB connect successful !");
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
      }, 100);
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

  await page.goto(`https://m.facebook.com/profile.php?v=friends`);
  await delay(5000);
  await autoScroll(page);
  const results2 = await page.evaluate(() => {
    const usersElements = document.querySelectorAll("._52jh._5pxc a");
    const mutualFriends = document.querySelectorAll(".notice.ellipsis");
    const isFriendWithSrapingUser = document.querySelectorAll(
      "._54k8._52jg._56bs._26vk._2b4n._56bt"
    );

    let users = [];

    for (let i = 0; i < usersElements.length; i++) {
      if (
        usersElements[i].getAttribute("href") !== null &&
        mutualFriends[i].innerText.includes("bạn chung")
      ) {
        users.push({
          facebookId: usersElements[i]
            .getAttribute("href")
            .replace("/profile.php?id=", "")
            .replace("/", "")
            .replace("?", "")
            .replace("&", "")
            .replace("refid=17", ""),
          name: usersElements[i].innerText,
          mutualFriendsWithSrapingUser: mutualFriends[i].innerText
            .replace(".", "")
            .replace(" bạn chung", ""),

          isFriendWithSrapingUser:
            isFriendWithSrapingUser[i].getAttribute("value") === "Bạn bè"
              ? true
              : false
        });
      }
    }
    return users;
  });
  // console.log(`Found ${results2.users.length}/${results2.element} users`);
  // console.log(results2.users);
  console.log(`Found ${results2.length} users`);
  results2.forEach(async user => {
    // console.log(user);
    const scrapingProfile = await Profile.findOne({
      facebookId: user.facebookId
    });
    if (!scrapingProfile) {
      console.log("new user", user);
      await Profile.create({ ...user, scrapingUser: username });
    }
  });

  // await page.screenshot({ path: "facebook.png" });

  // await browser.close();
})();
