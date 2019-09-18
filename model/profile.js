const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: [true, "Must have facebookId"],
    unique: true
  },
  name: String,
  uid: {
    type: String,
    unique: true
  },
  imgLarge: String,
  imgSmall: String,
  gender: String,
  birthday: Date,
  education: String,
  location: String,
  locationFrom: String,
  work: String,
  followers: Number,
  isVnuer: {
    type: Boolean,
    required: [true, "is vnuer?"],
    default: false
  },
  lastPosts: Array,
  alternateName: String,
  scrapingUser: String,
  mutualFriendsWithSrapingUser: Number,
  isFriendWithSrapingUser: Boolean,
  crawlDate: { type: Date, default: Date.now },
  workDone: String,
  educationDone: String,
  educationBefore: String,
  joinedDate: Date,
  other: Array,
  socialNetworks: String,
  love: String,
  language: String,
  religion: String,
  isMiniScraped: {
    type: Boolean,
    required: [true, "is mini scrapedd?"],
    default: false
  },
  isFullScraped: {
    type: Boolean,
    required: [true, "is full scrapedd?"],
    default: false
  },
  updatedScrape: Date
});

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
