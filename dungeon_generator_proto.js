const num_rooms = 18;
const Rooms = [] //the dungeon
const avaliable_rooms = []; //use for room connection

//Define rooms
class Room{
    constructor(id){
        this.id = id;
        //Room Content. Could be None (n), S(Start), E(End), Monster (M), Boss (B), Treasure(T)
        this.content = "n";
        //Connected rooms based on its directions.
        this.N = -1; //-1 means no connected room, -2 means wall on the corresponding side, positive number (including 0) indicates the adjacent room's id
        this.S = -1;
        this.E = -1;
        this.W = -1; 
        this.coord = [0,0];
        this.playerHere = false; //indicate whether the player is in the room
    }
    
    //mutator methods
    setContent(content){
        this.content = content;
    }
    
    setN(room){
        this.N = room;
    }

    setS(room){
        this.S = room;
    }

    setE(room){
        this.E = room;
    }

    setW(room){
        this.W = room;
    }

    //accessor methods
    go_N(){
        return this.N;
    }

    go_S(){
        return this.S;
    }

    go_E(){
        return this.E;
    }

    go_W(){
        return this.W;
    }

    getId(){
        return this.id;
    }

    *getAdj() {
        yield this.N;
        yield this.S;
        yield this.E;
        yield this.W;
    }

    connect(room, direction){
        if (room.id == this.id){ //handle error if it is connecting to the same room
            console.log("Error: same room.")
            return;
        }
        this.coord = room.coord.slice(); //copy by value
        if (direction == "N"){ //connect this room to the north of the target room
            room.setN(this.id);
            this.S = room.getId();
            this.coord[1] += 1; 
        } else if (direction == "S"){ //connect this room to the soth of the target room
            room.setS(this.id);
            this.N = room.getId();
            this.coord[1] -= 1; 
        } else if (direction == "E"){ //connect this room to the east of the target room
            room.setE(this.id);
            this.W = room.getId();
            this.coord[0] += 1; 
        } else if (direction == "W"){ //connect this room to the west of the target room
            room.setW(this.id);
            this.E = room.getId();
            this.coord[0] -= 1; 
        } else {
            console.log("Invalid direction.")
        }
    }
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function coord_in_list(coord){ //important. searches if a coordinate is inside the dungeon
    for (let i = 0; i < Rooms.length; i++) {
        const roomCoord = Rooms[i].coord;
        if (coord[0] === roomCoord[0] && coord[1] === roomCoord[1]) {
            return i; // Return the index of the room with the same coordinate
        }
    }
    return -1; // Return -1 if coordinate is not within the dungeon
}

function potential_loop_check(room){ //prevent loop from forming by checking the three adjacent coordinates of the newly created room
   const adj_rooms = [...room.getAdj()]; //get the room's adjacent rooms
   const temp_coord = room.coord.slice(); //copy by value
   //console.log(temp_coord); //debug
   let nearest_room_index = -1;

   if (adj_rooms[0] == -1){ //north slot is empty
        temp_coord[1] += 1; //temp_coord as the coord north to the current room
        nearest_room_index = coord_in_list(temp_coord);
        if (nearest_room_index != -1) { //nearest room is at risk of forming a loop as it exists in the current generated rooms
            //console.log(nearest_room_index + 'N');
            room.setN(-2); //put down "wall". prevent room from connecting to this side
            Rooms[nearest_room_index].setS(-2) //put down wall on the nearest room
        }
        temp_coord[1] -= 1; //revert
   }

   if (adj_rooms[1] == -1){ //south slot is empty
        temp_coord[1] -= 1; //temp_coord as the coord south to the current room
        nearest_room_index = coord_in_list(temp_coord);
        if (nearest_room_index != -1) { //nearest room is at risk of forming a loop as it exists in the current generated rooms
            //console.log(nearest_room_index + 'S');
            room.setS(-2); //put down "wall". prevent room from connecting to this side
            Rooms[nearest_room_index].setN(-2)
        }
        temp_coord[1] += 1; //revert
   }

    if (adj_rooms[2] == -1){ //east slot is empty
        temp_coord[0] += 1; //temp_coord as the coord east to the current room
        nearest_room_index = coord_in_list(temp_coord);
        if (nearest_room_index != -1) { //nearest room is at risk of forming a loop as it exists in the current generated rooms
            //console.log(nearest_room_index + 'E');
            room.setE(-2); //put down "wall". prevent room from connecting to this side
            Rooms[nearest_room_index].setW(-2)
        }
        temp_coord[0] -= 1; //revert
   }

    if (adj_rooms[3] == -1){ //west slot is empty
        temp_coord[0] -= 1; //temp_coord as the coord west to the current room
        nearest_room_index = coord_in_list(temp_coord);
        if (nearest_room_index != -1) { //nearest room is at risk of forming a loop as it exists in the current generated rooms
            //console.log(nearest_room_index + 'W');
            room.setW(-2); //put down "wall". prevent room from connecting to this side
            Rooms[nearest_room_index].setE(-2)
        }
        temp_coord[0] += 1; //revert
   }
}


function generate_layout(num_rooms){
    let chosen_room_ind = 0;
    let adj_rooms = [];
    for (let i = 0; i < num_rooms; i++){ //create Room Array (Dungeon) by filling it with rooms and connecting them
        Rooms.push(new Room(i));
        if (i > 0){ //if the newly generated room is not the starting room
            let min_index = (i < 3)? 0: i - 3; //calculate the minimum index for random selection. 
            do{
                chosen_room_ind = getRandomInt(min_index, i); //randomly choose room from last 3 rooms
                adj_rooms = [...Rooms[chosen_room_ind].getAdj()]; //obtain array of adjacent rooms of the chosen room
            } while (!adj_rooms.includes(-1)); //if the adjacent rooms do not have -1. 
            // that means at all directions are already connected rooms
            //console.log(chosen_room_ind) //debug
            chosen_direction = getRandomInt(0, adj_rooms.length); //randomly select direction, as the index of adj_rooms correspond to directions
            while(adj_rooms[chosen_direction] != -1 || adj_rooms[chosen_direction] == -2){
                chosen_direction = (++chosen_direction)%adj_rooms.length;
            }
            //connect room
            //console.log(chosen_direction) //debug
            switch(chosen_direction){
                case 0:
                    Rooms[i].connect(Rooms[chosen_room_ind], 'N');
                    break;
                case 1:
                    Rooms[i].connect(Rooms[chosen_room_ind], 'S');
                    break;
                case 2:
                    Rooms[i].connect(Rooms[chosen_room_ind], 'E');
                    break;
                case 3:
                    Rooms[i].connect(Rooms[chosen_room_ind], 'W');
                    break;
            }
            //potential loop check and prevention
            if (i > 2){
                potential_loop_check(Rooms[i]);
            }
        } else { //starting room. special case: ONLY FORWARD. Walls on S, E and W.
            Rooms[i].setS(-2);
            Rooms[i].setE(-2);
            Rooms[i].setW(-2);
        }
        //console.log(Rooms[i].coord)//debug 
    }
}

function add_map_content(Rooms){
    /*Constraints
        -Starting room is open only on the North
        -The Boss must be preceeding the exit.     
    */

    //set start and exit rooms.
    Rooms[0].setContent('S');
    Rooms[0].playerHere = true;
    Rooms[Rooms.length-1].setContent('E');
    //set boss room. The boss room is the room connected to the exit.
    let adj_rooms_exit = [...Rooms[Rooms.length-1].getAdj()] //adjacent rooms of the exit
    //console.log(adj_rooms_exit); //debug
    let boss_room_index = -1;
    for (let i = 0; i < adj_rooms_exit.length; i++){
        if (adj_rooms_exit[i] >= 0){
            boss_room_index = adj_rooms_exit[i];
            //console.log(boss_room_index); //debug
            Rooms[boss_room_index].setContent('B');
            break;
        }
    }
    //set remaining rooms' contents
    let prob = 0;
    for (let i = 1; i < Rooms.length-1; i++){
        if (Rooms[i].content != 'B'){
            prob = Math.random();
            if (prob < 0.45){
                continue; // 45% chance empty room
            } else if (prob >= 0.45 && prob < 0.75){
                Rooms[i].setContent('M'); //30% chance monster
            } else {
                Rooms[i].setContent('T'); //25% chance monster
            }
        }
    }
}

function generate_dungeon(num_rooms){
    Rooms.length = 0; //reset the dungeon
    console.log("Generating " + num_rooms + " rooms...");
    generate_layout(num_rooms);
    add_map_content(Rooms);
}

function printMap(Rooms) { //generated by ChatGPT-4o
    // Create a dictionary to map coordinates to rooms for easier lookup
    const coordToRoom = {};
    for (const room of Rooms) {
        const key = `${room.coord[0]},${room.coord[1]}`;
        coordToRoom[key] = room;
    }

    // Find the map boundaries to create a grid
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const room of Rooms) {
        const [x, y] = room.coord;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    // Initialize the grid
    const grid = Array(height * 2 - 1).fill(null).map(() => Array(width * 2 - 1).fill(" "));

    // Populate the grid with room IDs and connections
    for (const room of Rooms) {
        const [x, y] = room.coord;
        const gridX = (x - minX) * 2;
        const gridY = (maxY - y) * 2; // Invert Y-axis for correct display

        grid[gridY][gridX] = room.content

        // Add connections
        if (room.N >= 0) grid[gridY - 1][gridX] = "|"; // North connection
        if (room.S >= 0) grid[gridY + 1][gridX] = "|"; // South connection
        if (room.E >= 0) grid[gridY][gridX + 1] = "-"; // East connection
        if (room.W >= 0) grid[gridY][gridX - 1] = "-"; // West connection
    }

    // Print the grid
    for (const row of grid) {
        console.log(row.join(""));
    }
}

generate_dungeon(num_rooms);
printMap(Rooms);