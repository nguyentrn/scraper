// // // // // a = [
// // // // //   "Organizer tại HV - S.A.O",
// // // // //   "Học tại Foreign Trade University HCMC",
// // // // //   "Đã học tại Trường THPT Chuyên Hùng Vương - Gia LaiP",
// // // // //   "Sống tại Gia Lai, Gia Lai, Vietnam",
// // // // //   "Độc thân",
// // // // //   "Đã tham gia Tháng 6 năm 2016",
// // // // //   "bundaumamtom0312"
// // // // // ];

// // // // module.exports = {
// // // //   getInfoHome: rawInfo => {
// // // //     let profile = {};
// // // //     console.log("exeeeee");
// // // //     rawInfo.forEach(info => {
// // // //       if (info.includes("Học tại")) {
// // // //         profile.education = info.replace("Học tại ", "");
// // // //       } else if (info.includes("Đã học tại")) {
// // // //         profile.educationBefore = info.replace("Đã học tại ", "");
// // // //       } else if (info.includes("Sống tại")) {
// // // //         profile.location = info.replace("Sống tại ", "");
// // // //         //   }else if (info.includes("Đã học tại")) {
// // // //         //     profile.locationBefore = info.replace("Đã học tại ", "")
// // // //         //   }else if (info.includes("Đã học tại")) {
// // // //         //     profile.educationBefore = info.replace("Đã học tại ", "")
// // // //       } else if (info.includes("Đã tham gia")) {
// // // //         profile.joinedDate = info.replace("Đã tham gia ", "");
// // // //       }
// // // //     });

// // // //     return profile;
// // // //   }
// // // // };

// // // // // console.log(getInfo(a));

// // // // const formatDate = date => {
// // // //   let newDate = date
// // // //     .replace(" tháng ", "-")
// // // //     .replace(", ", "-")
// // // //     .split("-");
// // // //   console.log(newDate.length);
// // // //   if (newDate.length < 1) {
// // // //     newDate = null;
// // // //   } else if (newDate.length === 1) {
// // // //     newDate.unshift("1", "1");
// // // //   } else if (newDate.length < 3) {
// // // //     newDate.push("1900");
// // // //   }
// // // //   const done = newDate.reverse().join("-");
// // // //   return done;
// // // // };

// // // const a = "Đã tham gia Tháng 3 năm 2932";

// // // const formatDate = date => {
// // //   let newDate = date
// // //     .replace("Đã tham gia Tháng ", "1-")
// // //     .replace(" năm ", "-")
// // //     .split("-")
// // //     .reverse()
// // //     .join("-");

// // //   return newDate;
// // // };

// // // formatDate(a);
// // // console.log(formatDate(a));

// // // const module=require('module')

// // exports.delay = time => {
// //   return new Promise(function(resolve) {
// //     setTimeout(resolve, time);
// //   });
// // };

// // exports.autoScroll = async page => {
// //   await page.evaluate(async () => {
// //     await new Promise((resolve, reject) => {
// //       var totalHeight = 0;
// //       var distance = 100;
// //       var timer = setInterval(() => {
// //         var scrollHeight = document.body.scrollHeight;
// //         window.scrollBy(0, distance);
// //         totalHeight += distance;

// //         if (totalHeight >= scrollHeight) {
// //           clearInterval(timer);
// //           resolve();
// //         }
// //       }, 100);
// //     });
// //   });
// // };

// const random = (firtInit, SecondInit) =>
//   Math.floor(Math.random() * SecondInit + firtInit);

// const a = random(5000, 5000);
// console.log(a);
