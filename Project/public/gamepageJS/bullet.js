// This function defines the Bullet module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the bullet
// - `y` - The initial y position of the bullet
// - `gameArea` - The bounding box of the game area
const Bullet = function(ctx, x, y, angle, shooterId, bulletType, gameArea, obstacles) {

    // This is the sprite sequences of the 3 bullets
    // AR,SMG, shotgun.
    const sequences = {
        AR:  {x: 120, y:  165, width: 90, height: 24, count: 1, timing: 0, loop: false},
        SMG:  {x: 23, y:  160, width: 83, height: 24, count: 1, timing: 0, loop: false}, 
        shotgun:  {x: 692, y:  185, width: 101, height: 107, count: 1, timing: 0, loop: false} 
    };

    const shotgunRange = 450;    // can be changed later 
    const ARRange = 750;         // can be changed later
    const SMGRange = 500;        // can be changed later

    let range; 
    switch(bulletType){
        case "shotgun":
            range = shotgunRange;
            break;
        case "AR":
            range = ARRange;
            break;
        case "SMG":
            range = SMGRange;
            break;
        default:
            range = ARRange;
    }

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[bulletType])
          .setScale(0.7)
          .setShadowScale({ x: 0, y: 0 })      // no shadow 
          .useSheet("assets/bullet_sprites.png");

    // This is the moving speed (pixels per second) of the bullet, will be changed based on type 
    let speed = 1500; 

    // initial position of the bullet 
    let startX = x;         
    let startY = y;

    // calculate velocity
    const vx = Math.cos(angle - Math.PI/2);
    const vy = Math.sin(angle - Math.PI/2);

    let isAlive = true; 

    const remove = function(){
        isAlive = false;
    }


    // This function updates the bullet.
    // - `time` - The timestamp when this function is called
    const update = function(time, dt) {
        if (!isAlive) return;

        let {x, y} = sprite.getXY();

        // Move the bullet
        x+= vx * speed * dt;
        y+= vy * speed * dt;

        // Range check 
        const dx = x - startX;
        const dy = y - startY;
        const distanceTravelled = Math.sqrt(dx*dx + dy*dy);

        if (distanceTravelled > range) {
            isAlive = false;
            return;
        }

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
    };                                                                

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        getShooterId: () => shooterId,
        bulletType: bulletType,
        draw: draw,
        update: update, 
        isAlive: () => isAlive,
        remove:remove
    };
};
