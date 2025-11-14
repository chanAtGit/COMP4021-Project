const express = require("express"); // import express.js
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express(); //initialise express application

// Use the 'public' folder to serve static files
app.use(express.static("public"));

app.use(express.json());
// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// Handle any GET requests for the path '/serverinfo'
app.get("/serverinfo", (req, res) => {
    res.json({ name: "Node.js Server is active." });
});

// Handle any GET requests for the path '/'
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});


function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    let users = JSON.parse(fs.readFileSync("data/users.json"));

    if (!username || !avatar || !name || !password) {
        return res.json({ status: "error", error: "Username, avatar, name and password cannot be empty." });
    }
    if (!containWordCharsOnly(username)){
        return res.json({ status: "error", error: "Username contain only underscores, letters or numbers." });
    }
    if (users.hasOwnProperty(username)) {
        return res.json({ status: "error", error: "Username already exists." });
    }
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {
        avatar: avatar,
        name: name,
        password: hash
    };

    fs.writeFileSync("data/users.json", JSON.stringify(users, null, "   "));

    return res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    let users = JSON.parse(fs.readFileSync("data/users.json"));

    if (!(users.hasOwnProperty(username))) {
        return res.json({ status: "error", error: "Username does not exist." });
    }
    else if (!bcrypt.compareSync(password, users[username].password)) {
        return res.json({ status: "error", error: "Invalid password." });
    }

    req.session.user = username;
    return res.json({ status: "success", user: { username: username, avatar: users[username].avatar, name: users[username].name } });
    
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    const user = req.session.user;
    const userAccount = user ? req.body.user : null;
    if (!userAccount) {
        return res.json({status: "error", error: "User is not signed in."});
    }
    else {
        return res.json({ status: "success", user: userAccount });
    }
    //
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    req.session.user = null;
    return res.json({ status: "success"});
});

app.listen(8000, () => {
    console.log("The game server has started...");
}); //start web server at port 8000. IMPORTANT