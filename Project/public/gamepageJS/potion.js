// This function defines the Potion module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the potion
// - `y` - The initial y position of the potion

const Potion = function(ctx, x, y, potionType) {

    // This is the sprite sequences of the 3 potions
    // Green defense, purple speed, orange range.
    const sequences = {
        green:  { x: 128, y:  48, width: 16, height: 16, count: 1, timing: 0, loop: false },
        purple: { x: 64, y: 96, width: 16, height: 16, count: 1, timing: 0, loop: false },
        orange: { x: 112, y: 16, width: 16, height: 16, count: 1, timing: 0, loop: false }
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[potionType])
          .setScale(3)
          .setShadowScale({ x: 0.4, y: 0.4 })
          .useSheet("assets/potions_sprites.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the type of the potion.
    // - `potionType` - The type of the potion which can be
    // `"green"`, `"purple"`, `"orange"` 
    const setPotionType = function(potionType) {
        sprite.setSequence(sequences[potionType]);
        birthTime = performance.now();
    };

    // This function gets the age (in millisecond) of the potion.
    // - `now` - The current timestamp
    const getAge = function(now) {
        return now - birthTime;
    };

    // This function randomizes the potion type.
    const randomize = function() {
        /* Randomize the type */
        const types = ["green", "purple", "orange"];
        potionType = types[Math.floor(Math.random() * 3)];
        setPotionType(potionType);

        return potionType;
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setPotionType: setPotionType,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update
    };
};
