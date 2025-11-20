const express = require("express"); // import express.js
const {createServer} = require("http");
const {Server} = require("socket.io");

const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express(); //initialise express application
const httpServer = createServer(app);
const io = new Server(httpServer);

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

const onlineUsers = {}; //store online players

// Handle any GET requests for the path '/serverinfo'
app.get("/serverinfo", (req, res) => {
    res.json({ name: "Node.js Server is active." });
});

// Handle any GET requests for the path '/'
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/public/game.html");
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

    const returned_user =  {username: username, avatar: users[username].avatar, name: users[username].name};
    req.session.user = returned_user; //set req.session.user to object
    return res.json({ status: "success", user: returned_user});
    
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if (req.session.user == null){ //if req.session.user is undefined
        res.json({ status: "error", error: "User account does not exist" });
        console.log("User not found.");
        return;
    }
    //console.log(req.session.user);
    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", user: req.session.user });
    //
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
    req.session.user = null;
    return res.json({ status: "success"});
});

//-----------------WEBSOCKET SECTION-----------------------//
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    // Add a new user to the online user list
    const current_user = socket.request.session.user; //get socket user
    if (current_user != null){ //validation is good!
        onlineUsers[current_user.username] = {avatar: current_user.avatar, name: current_user.name}; //add to onlineUsers
        //io.emit("add user", JSON.stringify(current_user)); //broadcast to every client, so their online user panel will all show the new user
    }
    //console.log(onlineUsers);

    socket.on("disconnect", () => { //if a user's socket disconnects
        delete onlineUsers[current_user.username]; //delete from onlineUsers
        //io.emit("remove user", JSON.stringify(current_user));
        io.emit("remove user", JSON.stringify(onlineUsers));
        //console.log(onlineUsers);
    });

    socket.on("get users", ()=>{
        io.emit("users", JSON.stringify(onlineUsers)); //send onlineUsers back to browser. broadcast to everyone so they can who are connected.
        //console.log("user list sent");
    });

    socket.on("get gamepage", ()=>{
        io.emit("load gamepage"); //send message to all players to load gamepage
    });

    socket.on("post playerMove", (dx,dy,mouseX,mouseY)=> {
        const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
        const player_index = usernames.indexOf(current_user.username) + 1; // get which player (0 or 1) => (P1 or P2) is the user
        io.emit("update playerMove", dx,dy,mouseX,mouseY,player_index); //broadcast to all players to update each player's movements
    });
});

//-----------------WEBSOCKET SECTION END-------------------//
httpServer.listen(8000, () => {
    console.log("The game server has started...");
}); //start web server at port 8000. IMPORTANT