if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRoutes = require("./routes/listingRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const searchRoutes = require("./routes/searchRoutes.js");

const User = require("./models/userModel.js");

main()
	.then(() => {
		console.log("Connected Successfully");
	})
	.catch((err) => {
		console.log(err);
	});

async function main() {
	await mongoose.connect(process.env.MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
	mongoUrl: process.env.MONGO_URL,
	crypto: {
		secret: process.env.SECRET_CODE,
	},
	touchAfter: 24 * 3600,
});

store.on("error", () => {
	console.log("Error in MONGO SESSION STORE", error);
});

const sessionOptions = {
	store,
	secret: process.env.SECRET_CODE,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
	},
	httpOnly: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=========================================== Using locals we can use that anywhere in our code
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.successMsg = req.flash("Success");
	res.locals.errorMsg = req.flash("error");
	next();
});

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
app.use("/", searchRoutes);

//===========================================IF USER SEARCH WRONG ROUTE ERROR HANDLING
app.all("*", (req, res, next) => {
	next(new ExpressError(404, "Page Not Found"));
});

//===========================================ERROR HANDLING
app.use((err, req, res, next) => {
	let { statusCode = 500, message = "Something Went wrong!" } = err;
	res.render("listings/error.ejs", { message });
});

app.listen("8080", () => {
	console.log("listening on port 8080");
});
