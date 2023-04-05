//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const User = mongoose.model("User", userSchema);

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

app.post("/register", function(req, res) {
    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
       
        const newUser = new User({
            email: req.body.username, 
            password: hash,
        });
    
        newUser.save().then(() => {
            res.render("secrets");
        })
        .catch((err) => {
            console.log(err);
        });
    });

    
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });

        if (!foundUser) {
            // If no user with the given email address is found, render the login view with an error message
            return res.render('login', {error: "Invlid username or password. "});
        }
        //Compare the provioded password with the hashed password stored in the database
        const passwordMatchs = await bcrypt.compare(password, foundUser.password);

        if (!passwordMatchs) {
            // If the passwords don't match, render the login view with an error message
            return res.render('login', { error: 'Invalid username or password.' });
        }

        // If the paswords match, render the secrets view
        res.render('secrets');
    } catch (error) {
        // If there's an error while querying the database, log it and render the login view with an error message
        console.error(error);
        res.render('login', { error: 'An error occurred. Please try again later.' });
    }

     
});





app.listen(3000, () => {
    console.log("Server started on port 3000");
});