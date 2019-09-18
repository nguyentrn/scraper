const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Profile = require("./model/profile");

const usernames = [
  // "hcmftu2@gmail.com",
  // "hcmtdtu@gmail.com",
  // "hcmueh@gmail.com",
  // "vnuhcmiuu@gmail.com",
  // "hcmvnuutusuit@gmail.com",
  "vnuhcmuel@gmail.com",
  "vnuhcmussh@gmail.com"
];
// const username = "vnuhcmiuu@gmail.com";
let password = "130196";

const DB = "mongodb://localhost:27017/facebook";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("DB connect successful !");
  });

const random = (from, range) => Math.floor(Math.random() * range + from);

const delay = time => {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
};

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
  for (let i = 0; i < usernames.length; i++) {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-notifications"]
    });
    const context = browser.defaultBrowserContext();
    const username = usernames[i];
    const page = await browser.newPage();
    page.setViewport({ width: 1024, height: 720 });
    await page.goto("https://m.facebook.com");
    console.log("Sign In");
    await page.type("#m_login_email", username);
    if (username === "hcmftu2@gmail.com") {
      password = "13011996";
    } else {
      password = "130196";
    }
    await page.type("#m_login_password", password);
    await page.click("button[value='Đăng nhập']");
    console.log(`Signed as ${username}`);
    await page.waitForNavigation();

    context.clearPermissionOverrides();
    context.overridePermissions("https://facebook.com", ["notifications"]);

    page.on("dialog", dialog => {
      console.log("dialog");
      dialog.accept();
    });

    console.log("Start scraping");

    /////FULLL SCRAPE??????

    const profiles = await Profile.find({
      scrapingUser: username,
      isMiniScraped: false
    });
    console.log(`Found ${profiles.length} profiles`);

    for (let i = 0; i < 40; i++) {
      console.log(
        "----------Scraping basic information in Profile Page----------"
      );
      await delay(random(0, 100));
      console.log(`${i}/${profiles.length}`);
      const facebookId = profiles[i].facebookId;
      console.log(`Scraping ${facebookId}`);
      await page.goto(`https://www.facebook.com/${facebookId}/`);
      const basicInformation = await page.evaluate(() => {
        const banned = document.querySelector("h2.uiHeaderTitle");

        console.log(banned);
        if (!banned) {
          const uid = document
            .querySelector("._5h60")
            .getAttribute("data-gt")
            .split('":"')[1]
            .replace('","ref', "");

          let infos = document.querySelectorAll("._50f3");
          console.log(uid);

          console.log(banned);
          if (!infos) return null;
          const lastPosts = document.querySelectorAll(
            "._5pcr.userContentWrapper"
          );
          // let friends = document.querySelectorAll("._39g5");
          let infosText = [];
          infos.forEach(info => infosText.push(info.innerText));

          const imgLarge = `https://graph.facebook.com/${uid}?fields=picture.width(720).height(720)`;
          const imgSmall = `https://graph.facebook.com/${uid}/picture?type=large`;
          // return 0;
          let profileHomePage = { uid, imgLarge, imgSmall, other: [] };
          infosText.forEach(info => {
            console.log(info);
            if (info.includes("Chuyển tới")) {
            } else if (info.includes("Học")) {
              profileHomePage.education = info
                .replace("Học ", "")
                .replace("tại ", "");
            } else if (info.includes("Làm việc")) {
              profileHomePage.work = info
                .replace("Làm việc ", "")
                .replace("tại ", "");
            } else if (info.includes("Từng học")) {
              profileHomePage.educationBefore = info
                .replace("Từng học ", "")
                .replace("tại ", "");
            } else if (info.includes("Đã làm việc")) {
              profileHomePage.workDone = info
                .replace("Đã làm việc ", "")
                .replace("tại ", "");
            } else if (info.includes("Đã học")) {
              profileHomePage.educationDone = info
                .replace("Đã học ", "")
                .replace("tại ", "");
            } else if (info.includes("Sống")) {
              profileHomePage.location = info
                .replace("Sống ", "")
                .replace("tại ", "");
            } else if (info.includes("Đến từ")) {
              profileHomePage.locationFrom = info.replace("Đến từ ", "");
            } else if (
              info.includes("Độc thân") ||
              info.includes("Đã kết hôn") ||
              info.includes("mối quan hệ phức tạp") ||
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
            } else if (info.includes("người theo dõi")) {
              profileHomePage.followers = info
                .replace(".", "")
                .replace("Có ", "")
                .replace(" người theo dõi", "");
            } else {
              profileHomePage.other.push(info);
            }
            // if (friends.length === 2) {
            //   profileHomePage.friends = friends.innerText;
            // }
            profileHomePage.lastPosts = [];
            lastPosts.forEach(post =>
              profileHomePage.lastPosts.push({
                lastPostsTime: post.querySelector(".timestampContent")
                  .innerText,
                lastPostsLikes: post.querySelector("._81hb")
                  ? post.querySelector("._81hb").innerText
                  : 0,
                lastPostsComments: post.querySelector("._3hg-._42ft")
                  ? post.querySelector("._3hg-._42ft").innerText
                  : 0
              })
            );
          });
          return profileHomePage;
        }
        return null;
      });
      //   console.log("-------------Full scrape 2222222");
      //   await page.goto(`https://m.facebook.com/${facebookId}/photos`);
      //   const element = await page.$("strong");
      //   await element.click();
      //   await delay(3000);
      //   const results3 = await page.evaluate(() => {
      //     // document.querySelector("button[type=submit]").click();
      //     let emotions = document.querySelectorAll("._5feg");
      //     // let comments = document.querySelectorAll("._5feg:nth-child(even)");
      //     let innerText = [];
      //     for (let i = 0; i < emotions.length; i++) {
      //       innerText.push(emotions[i].textContent);
      //     }
      //     return innerText;
      //   });
      //   console.log(results3);
      // const newProfile = basicInformation;
      if (basicInformation) {
        const newProfile = await Profile.findOneAndUpdate(
          { facebookId },
          {
            $set: {
              ...basicInformation,
              isMiniScraped: true,
              updatedScrape: Date.now()
            }
          },
          { new: true }
        ).exec();
        console.log(newProfile);
      } else {
        console.log("Profile is banned in 1 hours");
        await browser.close();
        break;
      }
    }
    console.log("Sign Out");
    await browser.close();
    // if (i === usernames.length) i = 1;
    continue;
  }
  // await browser.close();
})();

////////Mini Scrape/////////////

// let profiles = await Profile.find({ isMiniScraped: false });
// console.log("found mini", profiles.length);
// for (let i = 0; i < profiles.length; i++) {
//   delay(1000);
//   console.log("-------------Crawling Info1");
//   console.log(`${i}/${profiles.length}`);
//   const facebookId = profiles[i].facebookId;

//   await page.goto(
//     `https://www.facebook.com/${facebookId}/about?section=contact-info`
//   );

//   const results1 = await page.evaluate(() => {
//     let labels = document.querySelectorAll("._50f4._5kx5");
//     let values = document.querySelectorAll("._4bl7._pt5 ._2iem");
//     let name = document.querySelector("._2nlw._2nlv");
//     let alternateName = document.querySelectorAll(
//       "_2nlw._2nlv .alternate_name"
//     );

//     let innerText = [];
//     for (let i = 0; i < labels.length; i++) {
//       innerText.push({
//         label: labels[i].innerText,
//         value: values[i].innerText
//       });
//     }

//     const dividedName = name.innerText.split("\n");

//     let profileAboutPage = {
//       name: dividedName[0] || name.innerText,
//       facebookId: name
//         .getAttribute("href")
//         .replace("https://www.facebook.com/", "")
//         .replace("profile.php?id=", ""),
//       alternateName: dividedName[1] || alternateName.innerText
//     };

//     innerText.forEach(info => {
//       if (info.label === "Facebook") {
//         info.label = "facebook";
//       } else if (info.label === "Liên kết xã hội") {
//         info.label = "socialNetworks";
//       } else if (info.label === "Giới tính") {
//         info.label = "gender";
//       } else if (info.label === "Thích") {
//         info.label = "love";
//       } else if (info.label === "Ngày sinh") {
//         info.label = "birthday";
//         let newDate = info.value
//           .replace(" tháng ", "-")
//           .replace(", ", "-")
//           .split("-");
//         if (newDate.length < 1) {
//           newDate = null;
//         } else if (newDate.length === 1) {
//           newDate.unshift("1", "1");
//         } else if (newDate.length < 3) {
//           newDate.push("1900");
//         }
//         info.value = newDate.reverse().join("-");
//       } else if (info.label === "Ngôn ngữ") {
//         info.label = "language";
//       } else if (info.label === "Quan điểm tôn giáo") {
//         info.label = "religion";
//       }
//       profileAboutPage[info.label] = info.value;
//     });

//     return profileAboutPage;
//   });

//   const newProfile = await Profile.findOneAndUpdate(
//     { facebookId },
//     { $set: { ...results1, isMiniScraped: true } },
//     { new: true }
//   ).exec();
//   console.log(newProfile);
// }
