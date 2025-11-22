// This function defines the Bullet module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the bullet
// - `y` - The initial y position of the bullet
// - `gameArea` - The bounding box of the game area
const Bullet = function(ctx, x, y, angle, bulletType, gameArea, obstacles) {

    // This is the sprite sequences of the 3 bullets
    // AR,SMG, shotgun.
    const sequences = {
        AR:  {x: 23, y:  160, width: 83, height: 24, count: 1, timing: 0, loop: false},
        SMG:  {x: 20, y:  77, width: 28, height: 21, count: 1, timing: 0, loop: false}, 
        shotgun:  {x: 20, y:  77, width: 28, height: 21, count: 1, timing: 0, loop: false} 
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[bulletType])
          .setScale(1)
          .setShadowScale({ x: 0.4, y: 0.4 })
          .useSheet("assets/bullet_sprites.png");

    // This is the moving speed (pixels per second) of the bullet, will be changed based on type 
    let speed = 400; 

    // calculate velocity
    const vx = Math.cos(angle - Math.PI/2) * speed;
    const vy = Math.sin(angle - Math.PI/2) * speed;

    let isAlive = true; 

    // This function updates the bullet.
    // - `time` - The timestamp when this function is called
    const update = function(time) {
        if (!isAlive) return;

        let {x, y} = sprite.getXY();

        x += vx / 60; 
        y += vy / 60;

        // destroy if outside game area
        if (!gameArea.isPointInBox(x, y)) {
            isAlive = false;
            return;
        }

        // obstacle collision
        for (let i = 0; i < obstacles.length; i++) {
            const obstacleBox = obstacles[i].getBoundingBox();
            if (obstacleBox.isPointInBox(x, y)) {
                isAlive = false;
                return;
            }
        }

        sprite.setXY(x, y);
        sprite.setRotation(angle - Math.PI/2); //rotate bullet to face moving direction
        sprite.update(time); 
    }

    const draw = function() {
        if (isAlive) {
            sprite.draw();
        }
    }

    /*
    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the type of the potion.
    // - `potionType` - The type of the potion which can be
    // `"green"`, `"purple"`, `"orange"` 
    const setBulletType = function(bulletType) {
        sprite.setSequence(sequences[bulletType]);
        birthTime = performance.now();
    };

    // This function gets the age (in millisecond) of the potion.
    // - `now` - The current timestamp
    const getAge = function(now) {      // NO NEED 
        return now - birthTime;
    };

    // This function randomizes the potion type. NO NEED 
    const randomize = function() {
        /* Randomize the type 
        const types = ["green", "purple", "orange"];
        setPotionType(types[Math.floor(Math.random() * 3)]);
    }; 
    */                                                                

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: draw,
        update: update, 
        isAlive: () => isAlive
    };
};
