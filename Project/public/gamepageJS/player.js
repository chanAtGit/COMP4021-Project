// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function(ctx, x, y, id, gameArea, obstacles) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences_blue = {
        empty:  { x: 150*4, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false },
        SMG:  { x: 150*8, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false },
        AR:  {x: 0, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false },
        Shotgun: {x: 150*7, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        defPotionHold: {x: 150*3, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        defPotionDrink: {x: 150*2, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        ragPotionHold: {x: 150*6, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        ragPotionDrink: {x: 150*5, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        spdPotionHold: {x: 150*10, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        spdPotionDrink: {x: 150*9, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false},
        dead: {x: 150*1, y: 0, width: 150, height: 150, count: 1, timing: 0, loop: false}
    };

    const sequences_red = {
        empty:  { x: 150*4, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false },
        SMG:  { x: 150*8, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false },
        AR:  {x: 0, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false },
        Shotgun: {x: 150*7, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        defPotionHold: {x: 150*3, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        defPotionDrink: {x: 150*2, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        ragPotionHold: {x: 150*6, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        ragPotionDrink: {x: 150*5, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        spdPotionHold: {x: 150*10, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        spdPotionDrink: {x: 150*9, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false},
        dead: {x: 150*1, y: 150, width: 150, height: 150, count: 1, timing: 0, loop: false}
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    let sequences;
    if (id == 1){ //player id, which can be 1 (player 1) or 2 (player 2)
        sequences = sequences_red;
    } else {
        sequences = sequences_blue;
    }

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.empty)
          .setScale(1)
          .setShadowScale({ x: 0.4, y: 0.4}) // { x: 0.75, y: 0.20 }
          .useSheet("assets/player_sprites.png");

    // This is the moving direction:
    let vx = 0;
    let vy = 0;

    // This is the moving speed (pixels per second) of the player
    let speed = 120;

    // This is the rotation angle (radian) of the player
    let angle = 0;

    // for firing bullets
    let lastFireTime = 0;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const setVelocity = function(dx, dy) {
        vx = dx;
        vy = dy;
    };

    // This function stops the player from moving.
    const stop = function() {
        vx = 0;
        vy = 0;
    };

    // This function speeds up the player by 30%. speed * 1.3
    const speedUp = function() {
        speed *= 1.3;
    };

    // This function slows down the player by 30%. speed * 0.7
    const slowDown = function() {
        speed *= 0.7;
    };

    const speedReset = function() {
        speed = 120;
    };

    const setAngle = function(mouseX, mouseY) { //accept mouse x and y coordinates as parameters
        let { x, y } = sprite.getXY();
        const dy = mouseY - y;
        const dx = mouseX - x;
        if (dx >= 0){
            angle = Math.PI/2 + Math.atan(dy/dx); //angle measured between the player and the mouse
        } else {
            angle = -Math.PI/2 + Math.atan(dy/dx);
        }
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        /* Update the player if the player is moving */
        let { x, y } = sprite.getXY();
        let collideWithObstacle = 0;

        if (vx != 0 || vy != 0) {
            /* Move the player */
            x += (vx * speed)/60;
            y += (vy * speed)/60;

            /* Set the new position if it is within the game area + (TO BE ADDED) not within an obstacle*/ 
            if (gameArea.isPointInBox(x, y)){
                for (let i = 0; i < obstacles.length; i++){
                    //the player's main body (excluding the arms) is 40px * 40x
                    const obstacleBox = obstacles[i].getBoundingBox();
                    if (obstacleBox.isPointInBox(x + 20,y) || obstacleBox.isPointInBox(x - 20,y) 
                        || obstacleBox.isPointInBox(x,y + 20) || obstacleBox.isPointInBox(x,y-20)){ //iterate over all obstacles to check collision
                        collideWithObstacle = 1;
                        break;
                    }
                }
                if (!collideWithObstacle){
                    sprite.setXY(x, y);
                }
            } 
        }

        sprite.setRotation(angle);

        /* Update the sprite object */
        sprite.update(time);
    };

    const fire = function(time, weaponType) {
        let fireRate;
        console.log("Attempting to fire at time " + time + "with wweapon " + weaponType);

        if (weaponType === "SMG") {
            fireRate = 0.2;
        }
        else if (weaponType === "AR") {
            fireRate = 0.5;    
        }
        else {
            fireRate = 0.75;     
        }

        if (time - lastFireTime < fireRate) {
            return false; // cannot fire yet
        }
        else {
            lastFireTime = time;
            console.log("lastFireTime updated to " + lastFireTime);
            return true; // can fire
        }
    }

    // The methods are returned as an object here.
    return {
        setVelocity: setVelocity,
        setAngle: setAngle,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        speedReset: speedReset,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        update: update, 
        getAngle: () => angle, 
        fire: fire
    };
};
