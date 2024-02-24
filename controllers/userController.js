const User = require("../models/userModel.js");

module.exports.getSignupForm = (req, res) => {
	res.render("users/signup.ejs");
};

//===========================================Sign Up
module.exports.signup = async (req, res) => {
	try {
		let { username, email, password } = req.body;

		const newUser = new User({ username, email });
		const registerdUser = await User.register(newUser, password);

		// If we want after signup that user must be a current user they don't need to login
		req.login(registerdUser, (err) => {
			if (err) {
				return next(err);
			}
			req.flash("Success", `Welcome to Airbnb ${newUser.username}!`);
			res.redirect("/listings");
		});
	} catch (error) {
		req.flash("error", error.message);
		res.redirect("/signup");
	}
};

//===========================================Log IN Form
module.exports.getLoginForm = (req, res) => {
	res.render("users/login.ejs");
};

//===========================================Log IN
module.exports.login = async (req, res) => {
	req.flash("Success", `Welcome Back ${req.user.username}!`);

	let redirectUrl = res.locals.redirectUrl || "/listings";
	res.redirect(redirectUrl);
};

//===========================================Log Out
module.exports.logout = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		req.flash("Success", "You are now logged out!");
		res.redirect("/listings");
	});
};
