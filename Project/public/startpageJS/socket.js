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
            socket.emit("get users");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            const usernames = Object.keys(onlineUsers); //get the usernames, which are the keys
            //console.log(usernames);
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

        socket.on("load gamepage", () => {
            window.location.href = '/game'; //tells the browser to navigate to that URL
        });

        socket.on("update playerMove", (dx,dy,mouseX,mouseY,player_index) => {
            //console.log(player_index); //debug
            // This will be handled in game.html where player objects exist
            window.updatePlayerMovement(dx, dy, mouseX, mouseY, player_index);
        });


        socket.on('initPotions', (serverPotions) => {
            console.log(serverPotions);
            // serverPotions.forEach((serverPotion, index) => {
            //     console.log(serverPotion);
            //     potions[index].setXY(serverPotion.x, serverPotion.y);
            //     potions[index].setPotionType(serverPotion.type);
            //     potions[index].birthTime = serverPotion.birthTime; // If you add birthTime to Potion module
            // });
        });
        
        socket.on('updatePotion', (data) => {
            const { index, x, y, type, birthTime } = data;
            potions[index].setXY(x, y);
            potions[index].setPotionType(type);
            potions[index].birthTime = birthTime; // Sync age
        });
        
        socket.on('potionPickedUp', (data) => {
            const { index } = data;
            // Hide the potion temporarily (e.g., move off-screen)
            potions[index].setXY(-1000, -1000);
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
    }

    //this function handles player movement. it sends server the data relating to the movement.
    const handlePlayerMovement = function(dx,dy,mouseX,mouseY){
        if (socket && socket.connected) {
            socket.emit("post playerMove", dx, dy, mouseX,mouseY); //send server message to update player movement
        }
    }

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

    return { getSocket, connect, disconnect, beginGame, handlePlayerMovement};
})();
