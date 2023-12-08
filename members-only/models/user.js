const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Longer password needed for bcrypt
const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true, maxLength: 200 },
});

// Virtual for user's URL
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/messageboard/user/${this._id}`;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
