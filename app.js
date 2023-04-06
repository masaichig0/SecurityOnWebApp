//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: [String]
});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



app.get("/", function(req, res){
    res.render('home');
});

app.get("/login", function(req, res){
    res.render('login');
});

app.get("/register", function(req, res){
    res.render('register');
});

app.get("/secrets", async function(req, res){
    try {
        const foundUsers = await User.find({"secret": {$ne: null}}).exec();
        if (foundUsers){
            res.render("secrets", {usersWithSecrets: foundUsers});
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
        res.render('submit');
      } else {
          res.redirect("/login")
      } 
});

app.post("/submit", async function(req, res){
    const submittedSecret = req.body.secret;

    //console.log(req.user.id);

    try {
        const foundUser = await User.findById(req.user.id);
        if (foundUser) {
          foundUser.secret.push(submittedSecret);
          await foundUser.save();
          res.redirect("/secrets");
        }
      } catch (err) {
        console.log(err);
      }

    
});


app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });    
});




app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });

    
});

app.post("/login", async function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
     
});





app.listen(3000, () => {
    console.log("Server started on port 3000");
});