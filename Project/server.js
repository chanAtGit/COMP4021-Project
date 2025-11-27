const express = require("express"); // import express.js
const {createServer} = require("http");
const {Server} = require("socket.io");

const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express(); //initialise express application
const httpServer = createServer(app);
const io = new Server(httpServer);

// server handle randomize
const potionPoints = [
    {x: 480, y: 160},
    {x: 1050, y: 620}
];
const potionTypes = ["green", "purple", "orange"];
// (array for 2 potions)
let potions = potionPoints.map(point => ({
    x: point.x,
    y: point.y,
    type: potionTypes[Math.floor(Math.random() * potionTypes.length)], // Initial random type
    birthTime: Date.now() // For age tracking
}));
const itemMaxAge = 20000;
const setPotionType = function(potionType) {
    sprite.setSequence(sequences[potionType]);
    birthTime = Date.now();
};

/*const randomize = function() {
    /* Randomize the type*/
    //setPotionType(potionTypes[Math.floor(Math.random() * 3)]);
//};*/
setInterval(() => {
    potions.forEach((potion, index) => {
        if (Date.now() - potion.birthTime >= itemMaxAge) {
            potion.type = potionTypes[Math.floor(Math.random() * potionTypes.length)];
            potion.birthTime = Date.now();
            io.emit('updatePotion', { index, ...potion }); // Broadcast respawn
        }
    });
}, 1000);

const weaponPoints = [          
    {x: 450, y: 620}, 
    {x: 760, y: 380}, 
    {x: 1100, y: 160}
];
const weaponTypes = ["AR", "SMG", "shotgun"];
/*const setWeaponType = function(weaponType) {
    sprite.setSequence(sequences[weaponType]);
    birthTime = Date.now();
};*/
let weapons = weaponPoints.map((point) => ({ //add i as unique id
    x: point.x,
    y: point.y,
    type: weaponTypes[0], //AR for now. Will be randomised on every initialisation
    birthTime: Date.now() // For age tracking
}));

let playerPosData = {};

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
        //console.log("User not found.");
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

    socket.on("get playerNum", ()=>{
        const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
        const player_index = usernames.indexOf(current_user.username) + 1; // get which player (0 or 1) => (P1 or P2) is the user
        socket.emit("playerNum", player_index);
    });

    socket.on("post playerMove", (dx,dy,mouseX,mouseY)=> {
        const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
        const player_index = usernames.indexOf(current_user.username) + 1; // get which player (0 or 1) => (P1 or P2) is the user
        io.emit("update playerMove", dx,dy,mouseX,mouseY,player_index); //broadcast to all players to update each player's movements
    });

    socket.on("get initWeapons", ()=>{
        for (let i = 0; i < weapons.length; i++){ 
            weapons[i].type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]; //randomise every initialisation
        }
        //console.log(`init weapons:${JSON.stringify(weapons)}`)
        io.emit("initWeapons", JSON.stringify(weapons));
        // setTimeout(() => {
        //     const newWeaponSet = weaponPoints.map(point => ({
        //         x: point.x,
        //         y: point.y,
        //         type: weaponTypes[Math.floor(Math.random() * weaponTypes.length)], // Initial random type
        //         birthTime: Date.now() // For age tracking
        //     }));
        //     io.emit("updateWeapons", newWeaponSet);
        // }, 20000);
    });

    socket.on("weaponPickup", (x, y, weaponType)=>{
        // const newWeaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]; 
        io.emit("weaponPickedup", x, y, weaponType);
        for (let i = 0; i < weapons.length; i++){
            if (weapons[i].x === x && weapons[i].y === y){
                weapons[i].x = -1000;
                weapons[i].y = -1000;
                weapons[i].type = weaponType;
                //console.log('new weapon spawned will be ' + weaponType);
                setTimeout(() => {
                    weapons[i].x = x;
                    weapons[i].y = y;
                    weapons[i].birthTime = Date.now();
                    io.emit("updateWeapons", weapons);
                }, 10000);
                break;
            }
        }
    });

    socket.on("weaponUpdate", (x, y, weaponType)=>{
        // const newWeaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]; 
        io.emit("weaponUpdated", x, y, weaponType);
        for (let i = 0; i < weapons.length; i++){
            if (weapons[i].x === x && weapons[i].y === y){
                weapons[i].x = x;
                weapons[i].y = y;
                weapons[i].type = weaponType;
                weapons[i].birthTime = Date.now();
                io.emit("updateWeapons", weapons);
                break;
            }
        }
    });

    socket.on("update playerAnV", (playerId, potionType)=>{
        io.emit("update playerAnV", playerId, potionType);
    })

    socket.on("get initPotions", () => {
        //console.log(`init potions:${potions}`)
        // io.emit("initPotions", potions);
        for (let i = 0; i < potions.length; i++){ 
            potions[i].type = potionTypes[Math.floor(Math.random() * potionTypes.length)]; //randomise every initialisation
        }
        io.emit("initPotions", JSON.stringify(potions));
    });

    // Handle potion pickup (sent from client when a player picks up a potion)
    socket.on('potionPickup', (x, y, potionType) => {
        /*
        const { index } = data;
        if (potions[index]) {
            // "Pick up" by respawning after delay
            // potions[index].birthTime = Date.now() - itemMaxAge; // Force respawn on next interval
            io.emit('potionPickedUp', { index }); // Notify all clients
        }*/
        io.emit("potionPickedup", x, y, potionType);
        for (let i = 0; i < potions.length; i++){
            if (potions[i].x === x && potions[i].y === y){
                potions[i].x = -1000;
                potions[i].y = -1000;
                potions[i].type = potionType;
                //console.log('new weapon spawned will be ' + weaponType);
                setTimeout(() => {
                    potions[i].x = x;
                    potions[i].y = y;
                    potions[i].birthTime = Date.now();
                    io.emit("updatePotions", potions);
                }, 10000);
                break;
            }
        }
    });

    socket.on("potionUpdate", (x, y, potionType)=>{
        // const newWeaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]; 
        io.emit("potionUpdated", x, y, potionType);
        for (let i = 0; i < potions.length; i++){
            if (potions[i].x === x && potions[i].y === y){
                potions[i].x = x;
                potions[i].y = y;
                potions[i].type = potionType;
                potions[i].birthTime = Date.now();
                io.emit("updatePotions", potions);
                break;
            }
        }
    });

    socket.on("get bullet", (x,y,angle,shooterId,weaponType) => {
        io.emit("push bullet", x,y,angle,shooterId,weaponType); //push bullet to everyone ie. both players
    });

    socket.on("get playerSprite", (playerId, playerStatus) => {
        io.emit("change playerSprite", playerId, playerStatus);
    });

    socket.on("post playerPos", (playerId, playersPos) => {
        const clientPlayerPos = JSON.parse(playersPos);
        if (playerId == 1){
            playerPosData = {...clientPlayerPos}; //copy playerPos. Server gives priority to player 1
        } /* else {
            if (playerPosData.length == 0){ //if playerPosData is empty at the moment
                playerPosData = {...clientPlayerPos}; //copy
            }
        }*/
        io.emit("sync playerPos", JSON.stringify(playerPosData));
    });

});

//-----------------WEBSOCKET SECTION END-------------------//
httpServer.listen(8000, () => {
    console.log("The game server has started...");
}); //start web server at port 8000. IMPORTANT