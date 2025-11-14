***Game Title: SHOWDOWN***
**Title of your project** 
The project's title is “Showdown”, a fast-paced 1v1 multiplayer top-down arena shooter.

**Game front page • What will be in it** 
Game Title
Registration & Sign in
Home page
Game description & player instructions in the middle
Pair-up button & username at the sidebar

**Gameplay page • Describe the game, how to play it, how to win/lose**
The two players are placed in an arena with walls and obstacles. They duel with each other using weapons and potions, collected from the arena. The game lasts up to 3 minutes and 30 seconds. It is split into three rounds, each lasting up to 70 seconds. A player wins a round by depleting their opponent’s HP, initially 100, to 0, with the game’s UI showing both players' HP bars. If the round ends with neither player dying, the player with the highest HP wins. A player wins the game by winning 2 out of three rounds. 

Each player has two slots - a weapon slot and an item slot. The weapon stores the player’s current weapon, while the item slot stores their equipped potion. The player can switch between their weapon and potion by selecting their corresponding slot.

The weapons include SMG, Shotgun, and AR. The SMG has a fast firing rate, but short range and low damage per bullet. The Shotgun provides high burst damage at the cost of short range and slow firing rate. The AR has the longest range out of the three weapons, as well as a medium firing rate and damage. The game features no reload mechanism. Thus, when a player collects a weapon, they are limited by said weapon’s ammo.

The potions aid the players in combat. The green Defense potion increases the player's resistance against damage at the cost of their speed. The purple Speed potion increases the player’s speed but decreases their damage resistance. The orange Rage potion increases the player’s damage at the cost of their damage resistance. Each potion takes 2.5 seconds to consume, and its effect lasts 8 seconds.

Random weapons and potions appear at fixed points in the arena for the players to collect. Only a maximum of three uncollected items are allowed on the arena, so they will not spawn indefinitely. Once a player collects an item, it will take 20 seconds for a new item to spawn.

The game will enter a sudden-death mode if a round reaches its last 15 seconds. By then, all obstacles will disappear, and the players will deal double the normal damage.

WASD keys control the players’ movements, and their avatar faces towards their cursor. ‘Q’ and ‘E’ are used to select the player's weapon and item slot, respectively. Holding the mouse’s left key fires the player’s weapon or consumes their potion. The ‘F’ key is used to collect items.

**Game over page • What will be in it**
Match Duration
Damage dealt by each player
Shots fired by each player
Number of Potions used by each player
The most used weapon by each player
Ranking table of all players by victories 
Back to the front page button

**Cheating • How you will support enabling and disabling it**
Pressing the ‘I’ key in the game will toggle unlimited bullets.

- Location of different weapons 
- AR: context.drawImage(sheet, 260, 30, 70, 20,100, 0, 70, 20) 
    (260, 30)
- SMG: context.drawImage(sheet, 380, 140, 70, 30, 100, 50, 70, 30)
    (380, 140)
- Shotgun: context.drawImage(sheet, 460, 100, 70, 18, 100, 100, 70, 18) 
    (460, 100)
- RPG: context.drawImage(sheet, 890, 110, 100, 25, 100, 150, 100, 25)   
    (890, 110)
