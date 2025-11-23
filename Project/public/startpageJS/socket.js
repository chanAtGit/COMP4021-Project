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

        socket.on("initWeapons", (serverWeapons) => {
            console.log(serverWeapons);
            serverWeapons.forEach((serverWeapon, index) => {
                window.weapons[index].setXY(serverWeapon.x, serverWeapon.y);
                window.weapons[index].setWeaponType(serverWeapon.type);
                window.weapons[index].birthTime = serverWeapon.birthTime; // Sync age
            });
        })
        socket.on('weaponPickedup', (x, y, newWeaponType) => {
            for (let i = 0; i < window.weapons.length; i++){
                if (window.weapons[i].x === x && window.weapons[i].y === y){
                    window.weapons[i].x = -1000;
                    window.weapons[i].y = -1000;
                    window.weapons[i].weaponType = newWeaponType;
                    break;
                }
            }
        })
        socket.on('updateWeapons', (serverWeapons) => {
            console.log(serverWeapons);
            serverWeapons.forEach((serverWeapon, index) => {
                window.weapons[index].setXY(serverWeapon.x, serverWeapon.y);
                window.weapons[index].setWeaponType(serverWeapon.type);
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

    const sendWeaponPickup = function(x, y){
        if (socket && socket.connected) {
            console.log("send weaponPickup");
            socket.emit("weaponPickup", x, y); //send server message to get gamepage
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

    return { getSocket, connect, disconnect, beginGame, getPlayerNum, sendWeaponPickup, getInitWeapons, getInitPotions, handlePlayerMovement};
})();
