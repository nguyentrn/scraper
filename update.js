const mongoose = require("mongoose");
const Profile = require("./model/profile");

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
    console.log("DB connect successfull !");
  });
// (async function() {
//   const res = await Profile.updateMany(
//     { scrapingUser: "hcmftu2@gmail.com" },
//     { isMiniScraped: false }
//   );
//   console.log(res.n, res.nModified);
// })();
(async function() {
  const res = await Profile.find({
    scrapingUser: "hcmftu2@gmail.com"
  }).remove();

  console.log(res.n, res.nModified);
})();
// res.n; // Number of documents matched
// res.nModified; // Number of documents modified
