//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


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

//Create those before Create mongoose model.
userSchema.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ["password"]});

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
    const newUser = new User({
        email: req.body.username, 
        password: req.body.password,
    });

    newUser.save().then(() => {
        res.render("secrets");
    })
    .catch((err) => {
        console.log(err);
    });
});

app.post("/login", async function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser && foundUser.password === password) {
            res.render("secrets");
        } else {
            res.render("login", { error: "Invalid password.", email: username, password: password });
        }
    } catch (err) {
        console.log(err);
    }
});





app.listen(3000, () => {
    console.log("Server started on port 3000");
});