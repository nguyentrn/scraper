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

const profileSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: [true, "Must have facebookId"],
    unique: true
  },
  name: {
    type: String,
    required: [true, "Must have name"]
  },
  gender: String,
  birthday: Date,
  education: String,
  location: String,
  locationFrom: String,
  work: String,
  followers: Number,
  alternateName: String,
  workDone: String,
  educationDone: String,
  educationBefore: String,
  joinedDate: Date,
  other: Array,
  socialNetworks: String,
  crawlDate: { type: Date, default: Date.now },
  love: String,
  language: String,
  religion: String
});

const Profile = mongoose.model("Profile", profileSchema);

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
      await page.goto(
        `https://www.facebook.com/${profiles[i]}/about?section=contact-info`
      );

      const results1 = await page.evaluate(() => {
        let labels = document.querySelectorAll("._50f4._5kx5");
        let values = document.querySelectorAll("._4bl7._pt5 ._2iem");
        let name = document.querySelector("._2nlw._2nlv");
        let alternateName = document.querySelectorAll(
          "_2nlw._2nlv .alternate_name"
        );

        let innerText = [];
        for (let i = 0; i < labels.length; i++) {
          innerText.push({
            label: labels[i].innerText,
            value: values[i].innerText
          });
        }

        const dividedName = name.innerText.split("\n");

        let profileAboutPage = {
          name: dividedName[0] || name.innerText,
          facebookId: name
            .getAttribute("href")
            .replace("https://www.facebook.com/", "")
            .replace("profile.php?id=", ""),
          alternateName: dividedName[1] || alternateName.innerText
        };

        innerText.forEach(info => {
          if (info.label === "Facebook") {
            info.label = "facebook";
          } else if (info.label === "Liên kết xã hội") {
            info.label = "socialNetworks";
          } else if (info.label === "Giới tính") {
            info.label = "gender";
          } else if (info.label === "Thích") {
            info.label = "love";
          } else if (info.label === "Ngày sinh") {
            info.label = "birthday";
            let newDate = info.value
              .replace(" tháng ", "-")
              .replace(", ", "-")
              .split("-");
            if (newDate.length < 1) {
              newDate = null;
            } else if (newDate.length === 1) {
              newDate.unshift("1", "1");
            } else if (newDate.length < 3) {
              newDate.push("1900");
            }
            info.value = newDate.reverse().join("-");
          } else if (info.label === "Ngôn ngữ") {
            info.label = "language";
          } else if (info.label === "Quan điểm tôn giáo") {
            info.label = "religion";
          }
          profileAboutPage[info.label] = info.value;
        });

        return profileAboutPage;
      });
      console.log("-------------Crawling info2");
      await page.goto(`https://www.facebook.com/${profiles[i]}/`);

      const results2 = await page.evaluate(() => {
        let infos = document.querySelectorAll("._50f3");
        let lastPostsTimestamp = document.querySelectorAll(
          "_5pcq .timestampContent"
        );
        let lastPostsLikes = document.querySelectorAll("._81hb");

        let infosText = [];
        infos.forEach(info => infosText.push(info.innerText));

        let profileHomePage = { other: [] };
        console.log("exeeeee");
        infosText.forEach(info => {
          console.log(info);
          if (info.includes("Chuyển tới")) {
          } else if (info.includes("Học tại")) {
            profileHomePage.education = info.replace("Học tại ", "");
          } else if (info.includes("Làm việc tại")) {
            profileHomePage.work = info.replace("Làm việc tại ", "");
          } else if (info.includes("Từng học tại")) {
            profileHomePage.educationBefore = info.replace("Từng học tại ", "");
          } else if (info.includes("Đã làm việc tại")) {
            profileHomePage.workDone = info.replace("Đã làm việc tại ", "");
          } else if (info.includes("Đã học tại")) {
            profileHomePage.educationDone = info.replace("Đã học tại ", "");
          } else if (info.includes("Sống tại")) {
            profileHomePage.location = info.replace("Sống tại ", "");
          } else if (info.includes("Đến từ")) {
            profileHomePage.locationFrom = info.replace("Đến từ ", "");
          } else if (
            info.includes("Độc thân") ||
            info.includes("Đã kết hôn") ||
            info.includes("Hẹn hò")
          ) {
            profileHomePage.relationship = info;
          } else if (info.includes("Đã tham gia")) {
            profileHomePage.joinedDate = info
              .replace("Đã tham gia Tháng ", "1-")
              .replace(" năm ", "-")
              .split("-")
              .reverse()
              .join("-");
          } else if (info.includes("Có")) {
            profileHomePage.followers = info
              .replace("Có ", "")
              .replace(" người theo dõi", "");
          } else {
            profileHomePage.other.push(info);
          }
          infos.forEach(info => infosText.push(info.innerText));
          for (let i = 0; i < lastPostsTimestamp; i++) {
            console.log(lastPostsTimestamp[i], lastPostsLikes[i]);
            profileHomePage.lastPostsTimestamp.push(
              lastPostsTimestamp[i].innerText
            );
            profileHomePage.lastPostsLikes.push(lastPostsLikes[i].innerText);
          }
        });
        return profileHomePage;
      });

      // await page.goto(`https://m.facebook.com/${profiles[i]}/photos`);
      // const element = await page.$("strong");
      // await element.click();
      // await delay(5000);
      // const results4 = await page.evaluate(() => {
      //   // document.querySelector("button[type=submit]").click();
      //   let emotions = document.querySelectorAll("._5feg");
      //   // let comments = document.querySelectorAll("._5feg:nth-child(even)");

      //   let innerText = [];
      //   for (let i = 0; i < emotions.length; i++) {
      //     innerText.push(
      //       emotions[i].textContent
      //       // label: emotions[i].getAttribute("aria-label"),
      //       // value: emotions[i + 1].getAttribute("aria-label")
      //     );
      //   }
      //   return innerText;
      // });
      const newProfile = await Profile.create({ ...results1, ...results2 });
      console.log(newProfile);
      crawl.push(newProfile);
    }
  }
  await page.screenshot({ path: "facebook.png" });

  // await browser.close();
})();
