module GameModule.State{
  export class Preloader extends Phaser.State{
    game: Phaser.Game;

    background: Phaser.Sprite = null;
    preloadBar: Phaser.Sprite = null;
    ready:boolean = false;

    constructor(game:Phaser.Game) {
      super();
      this.game = game;
    }

    preload(){
      var bg = this.game.add.image(0, 0, 'phaser');
      bg.height = this.game.height;
      bg.width=this.game.width;

      var preloadbar:Phaser.Image = this.game.cache.getImage('preloaderBar');
      var xpos:number=0;
      var ypos:number=0;
      xpos=this.game.width/2- (preloadbar ? preloadbar.width/2 : 200);
      ypos=this.game.height/2- (preloadbar ? preloadbar.height/2 : 25);
      this.preloadBar = this.game.add.sprite(xpos>0?xpos:0, ypos>0?ypos:0,  'preloaderBar');
      this.game.load.setPreloadSprite(this.preloadBar);

  		this.game.load.image('titlepage', 'asset/image/title-page.png');
  		this.game.load.image('land', 'asset/image/land.png');
  		this.game.load.image('marker', 'asset/image/marker.png');
  		this.game.load.image('missile', 'asset/image/missile.png');
  		this.game.load.image('sky', 'asset/image/sky.png');
  		this.game.load.spritesheet('city', 'asset/image/city.png', 64, 36);

      this.game.load.audio("strike",
        [ "/asset/sound/missile-strike.ogg",
          "/asset/sound/missile-strike.wav",
          "/asset/sound/missile-strike.mp3"]);
    }

    create(){
		    this.game.state.start('MainMenu');
    }

  }
}
