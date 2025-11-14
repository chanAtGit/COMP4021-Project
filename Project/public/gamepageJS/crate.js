// This function defines the Crate module.
// - `ctx` - A canvas context for drawing
// - `x` - The x position of the player
// - `y` - The y position of the player
// - `ver` - The sprite version of the crate
// - `gameArea` - The bounding box of the game area

const Crate = function(ctx, x, y, ver){

    const sequence_crate = { x: 0, y: 0, width: 512, height: 512, count: 1, timing: 0, loop: false };

    // This is the sprite object of the crate created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    let crate_path;
    let scale;
    switch(ver){
        case 1:
            crate_path = "assets/barrel1.png";
            scale = 0.125;
            break;
        case 2:
            crate_path = "assets/barrel2.png";
            scale = 0.25;
            break;
        default: //else
            crate_path = "assets/barrel3.png";
            scale = 0.25;
    }

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequence_crate)
          .setScale(scale)
          .setShadowScale({ x: 0, y: 0}) // No shadow
          .useSheet(crate_path);
    
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
}