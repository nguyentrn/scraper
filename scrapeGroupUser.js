const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const helper = require("./helpers");

console.log("aaaa");

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

const userSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: [true, "Must have facebookId"],
    unique: true
  },
  isMiniScraped: {
    type: Boolean,
    required: [true, "is scrapedd?"],
    default: false
  }
});

const User = mongoose.model("User", userSchema);

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
  const group = "453452961352713";
  // await page.goto(
  //   `https://m.facebook.com/browse/group/members/?id=${group}&start=0`
  // );
  // await autoScroll(page);
  // const results1 = await page.evaluate(() => {
  //   const usersElements = document.querySelectorAll("._5xu4 a");

  //   let users = [];
  //   usersElements.forEach(user => {
  //     if (
  //       user.getAttribute("href") &&
  //       user.getAttribute("href").includes("?fref=gm")
  //     ) {
  //       users.push(
  //         user
  //           .getAttribute("href")
  //           .replace("/", "")
  //           .replace("?fref=gm", "")
  //       );
  //     }
  //   });
  //   return users;
  // });

  await page.goto(
    `https://m.facebook.com/browse/group/members/?id=${group}&start=0&listType=list_nonfriend_nonadmin`
  );
  await autoScroll(page);
  const results2 = await page.evaluate(() => {
    const usersElements = document.querySelectorAll("._5xu4 a");

    let users = [];
    usersElements.forEach(user => {
      if (
        user.getAttribute("href") &&
        user.getAttribute("href").includes("?fref=gm")
      ) {
        users.push(
          user
            .getAttribute("href")
            .replace("/", "")
            .replace("?fref=gm", "")
        );
      }
    });
    return users;
  });
  console.log(`Found ${results2.length} users`);
  results2.forEach(async user => {
    console.log(user);
    await User.create({ facebookId: user });
  });
  // await page.screenshot({ path: "facebook.png" });

  // await browser.close();
})();
