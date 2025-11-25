const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            console.log("connected.");
            socket.emit("get users");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
            console.log(usernames);
            $("#connected-users").text(usernames); //display connected users
        });

        // Set up the remove user event
        socket.on("remove user", (onlineUsers) => {
            //user = JSON.parse(user);

            // Remove the online user
            //OnlineUsersPanel.removeUser(user);
            onlineUsers = JSON.parse(onlineUsers);
            const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
            if (usernames.length === 0){ //if no users left
                $("#connected-users").text("None");
            } else {
                $("#connected-users").text(usernames);
            }
        });

        //GAME PAGE FUNCTIONS//
        socket.on("load gamepage", () => {
            window.location.href = '/game'; //tells the browser to navigate to that URL
        });

        socket.on("playerNum", (player_index)=>{
            window.playerId = player_index;
            console.log(playerId);
        });

        socket.on("update playerMove", (dx,dy,mouseX,mouseY,player_index) => {
            //console.log(player_index); //debug
            // This will be handled in game.html where player objects exist
            window.updatePlayerMovement(dx, dy, mouseX, mouseY, player_index);
        });

        socket.on("initWeapons", (server_weapons) => {
            //console.log(server_weapons);
            const serverWeapons = JSON.parse(server_weapons);
            console.log(serverWeapons);
            //console.log(window.weapons);
            serverWeapons.forEach((serverWeapon, index) => {
                //console.log(serverWeapon.x);
                window.weapons[index].setXY(serverWeapon.x, serverWeapon.y);
                window.weapons[index].setWeaponType(serverWeapon.type);
                window.weapons[index].weaponType = serverWeapon.type;
                window.weapons[index].birthTime = serverWeapon.birthTime; // Sync age
            });
        })
        socket.on('weaponPickedup', (x, y, newWeaponType) => {
            //console.log("weapon picked up! new weapon type is "+newWeaponType+". Location = "+x+","+y);
            //console.log(window.weapons);
            for (let i = 0; i < window.weapons.length; i++){
                //console.log(window.weapons[i].x + "," + window.weapons[i].y);
                let weapon_coords = window.weapons[i].getXY();
                if (weapon_coords.x == x && weapon_coords.y == y){
                    //console.log("The weapon is: "+window.weapons[i]);
                    //window.weapons[i].x = -1000;
                    //window.weapons[i].y = -1000;
                    window.weapons[i].setXY(-1000, -1000);
                    window.weapons[i].setWeaponType(newWeaponType);
                    break;
                }
            }
        })
        socket.on('updateWeapons', (serverWeapons) => {
            console.log("Update weapons");
            serverWeapons.forEach((serverWeapon, index) => {
                window.weapons[index].setXY(serverWeapon.x, serverWeapon.y);
                window.weapons[index].setWeaponType(serverWeapon.type);
                console.log('updated weapon type is ' + serverWeapon.type);
                window.weapons[index].weaponType = serverWeapon.type;
                window.weapons[index].birthTime = serverWeapon.birthTime; // Sync age
            });
        })

        socket.on("initPotions", (serverPotions) => {
            console.log(serverPotions);
            serverPotions.forEach((serverPotion, index) => {
                window.potions[index].setXY(serverPotion.x, serverPotion.y);
                window.potions[index].setPotionType(serverPotion.type);
                window.potions[index].birthTime = serverPotion.birthTime; // If you add birthTime to Potion module
            });
        });
        
        socket.on('updatePotion', (data) => {
            const { index, x, y, type, birthTime } = data;
            window.potions[index].setXY(x, y);
            window.potions[index].setPotionType(type);
            window.potions[index].birthTime = birthTime; // Sync age
        });
        
        socket.on('potionPickedUp', (data) => {
            const { index } = data;
            // Hide the potion temporarily (e.g., move off-screen)
            window.potions[index].setXY(-1000, -1000);
            // The server will handle respawn and send 'updatePotion'
        });

        socket.on("push bullet", (x,y,angle,weaponType) => {
            //const bullet = JSON.parse(bullet_json);
            //console.log("pushing bullet");
            window.addBullet(x,y,angle,weaponType);
        });

        socket.on("change playerSprite", (playerId, playerStatus) => {
            window.changePlayerSprite(playerId, playerStatus);
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        $("#connected-users").text("None"); //revert connected-users text to None
        socket.disconnect();
        socket = null;
    };

    //this function calls to get gamepage. If one socket calls this function, it loads the game page for everyone.
    const beginGame = function(){ //function to load game page
        if (socket && socket.connected) {
            console.log("begin game");
            socket.emit("get gamepage"); //send server message to get gamepage
        }
    };

    const getPlayerNum = function(){
        if (socket && socket.connected) {
            console.log("get playerNum");
            socket.emit("get playerNum"); //send server message to get gamepage
        }
    };

    const getInitWeapons = function(){
        if (socket && socket.connected) {
            console.log("get initWeapons");
            socket.emit("get initWeapons"); //send server message to get gamepage
        }
    };

    const sendWeaponPickup = function(x, y, weaponType){
        if (socket && socket.connected) {
            //console.log("send weaponPickup");
            socket.emit("weaponPickup", x, y, weaponType); //send server message to get gamepage.original
            //socket.emit("weaponPickup", x, y, weaponType);
        }
    };

    const getInitPotions = function(){
        if (socket && socket.connected) {
            console.log("get initPotions");
            socket.emit("get initPotions"); //send server message to get gamepage
        }
    };

    //this function handles player movement. it sends server the data relating to the movement.
    const handlePlayerMovement = function(dx,dy,mouseX,mouseY){
        if (socket && socket.connected) {
            socket.emit("post playerMove", dx, dy, mouseX,mouseY); //send server message to update player movement
        }
    };

    const pushBullet = function(x,y,angle,weaponType){
        if (socket && socket.connected) {
            //console.log("Bullet info received by socket");
            socket.emit("get bullet", x,y,angle,weaponType); //send server message to update player movement
        }
    };

    //Important socket function - changePlayerSprite
    /*status is an integer value that determines the player status
    0 - noItem
    1 - SMG
    2 - AR
    3 - Shotgun
    4 - defPotionHold
    5 - defPotionDrink
    6 - ragPotionHold
    7 - ragPotionDrink
    8 - spdPotionHold
    9 - spdPotionDrink
    10 - dead
    */
    const changePlayerSprite = function(playerId, status){
        if (socket && socket.connected){
            socket.emit("get playerSprite", playerId, status);
        }
    };

    // This function sends a post message event to the server
    /*
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    const getTyping = function(){
        if (socket && socket.connected) {
            socket.emit("get typing");
        }
    }*/

    return {
        getSocket, 
        connect, 
        disconnect, 
        beginGame, 
        getPlayerNum, 
        sendWeaponPickup, 
        getInitWeapons, 
        getInitPotions, 
        handlePlayerMovement, 
        pushBullet,
        changePlayerSprite
    };
})();
