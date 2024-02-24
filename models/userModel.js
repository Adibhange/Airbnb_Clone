const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// Passport-Local Mongoose will add a username, hash and salt field to store the username,the hashed password and the salt value.
//So we not need to add that field in schema but You can add other fields here

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
