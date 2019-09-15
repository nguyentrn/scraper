const userSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: [true, "Must have facebookId"],
    unique: true
  },
  name: {
    type: String,
    required: [true, "Must have name"]
  },
  isMiniScraped: {
    type: Boolean,
    required: [true, "is scrapedd?"],
    default: false
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
