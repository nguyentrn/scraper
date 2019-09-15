const mongoose = require("mongoose");
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
module.exports = Profile;
