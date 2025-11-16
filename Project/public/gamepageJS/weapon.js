// This function defines the Weapon module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the weapon
// - `y` - The initial y position of the weapon 

const Weapon = function(ctx, x, y, weaponType) {

    // This is the sprite sequences of the 3 weapons
    // AR, SMG and shotgun.
    const sequences = {
        AR:  { x: 260, y:  30, width: 70, height: 20, count: 1, timing: 0, loop: false },
        SMG:    { x: 380, y: 140, width: 70, height: 30, count: 1, timing: 0, loop: false },
        shotgun: { x: 460, y: 100, width: 70, height: 18, count: 1, timing: 0, loop: false }
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[weaponType])
          .setScale(3)
          .setShadowScale({ x: 0.4, y: 0.4 })
          .useSheet("assets/weapon_sprites.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the type of the weapon.
    // - `weaponType` - The type of the weapon which can be
    // `"AR"`, `"SMG"`, `"shotgun"` 
    const setWeaponType = function(weaponType) {
        sprite.setSequence(sequences[weaponType]);
        birthTime = performance.now();
    };

    // This function gets the age (in millisecond) of the weapon.
    // - `now` - The current timestamp
    const getAge = function(now) {
        return now - birthTime;
    };

    // This function randomizes the weapon type.
    const randomize = function() {
        /* Randomize the type */
        const types = ["AR", "SMG", "shotgun"];
        setWeaponType(types[Math.floor(Math.random() * 3)]);
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setWeaponType: setWeaponType,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update
    };
};
