var game = new Phaser.Game(400, 490, Phaser.AUTO, "gameDiv");

var mainState = {

    preload: function() {
        if(!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.setMinMax(game.width/2, game.height/2, game.width, game.height);
        }

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#71c5cf';

        game.load.image('character', 'assets/character.jpg');
        game.load.image('pipe', 'assets/pipe.png');

        // Load the jump sound
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.character = game.add.sprite(100, 245, 'character');
        game.physics.arcade.enable(this.character);
        this.character.body.gravity.y = 1000;

        // New anchor position
        this.character.anchor.setTo(-0.2, 0.5);

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        // Add the jump sound
        this.jumpSound = game.add.audio('jump');
        this.jumpSound.volume = 0.2;
    },

    update: function() {
        if (this.character.y < 0 || this.character.y > game.world.height)
            this.restartGame();

        game.physics.arcade.overlap(this.character, this.pipes, this.hitPipe, null, this);

        // Slowly rotate the character downward, up to a certain point.
        if (this.character.angle < 20)
            this.character.angle += 1;
    },

    jump: function() {
        // If the character is dead, he can't jump
        if (this.character.alive == false)
            return;

        this.character.body.velocity.y = -350;

        // Jump animation
        game.add.tween(this.character).to({angle: -20}, 100).start();

        // Play sound
        this.jumpSound.play();
    },

    hitPipe: function() {
        // If the character has already hit a pipe, we have nothing to do
        if (this.character.alive == false)
            return;

        // Set the alive property of the character to false
        this.character.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe = game.add.sprite(x, y, 'pipe');
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);

        pipe.body.velocity.x = -200;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1;

        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole +1)
                this.addOnePipe(400, i*60+10);

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

game.state.add('main', mainState);
game.state.start('main');
