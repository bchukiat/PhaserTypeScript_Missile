module GameModule.State{
  export class Game extends Phaser.State{
    game: Phaser.Game;

    rocketsBitmap:Phaser.BitmapData;
    rocketsLayer:Phaser.Image;

    explosionsBitmap:Phaser.BitmapData;
    explosionsLayer:Phaser.Image;

    missilesBitmap:Phaser.BitmapData;
    missilesLayer:Phaser.Image;

    missileLauncher:GameModule.MissileLauncher;
    rocketLauncher;

    land:Phaser.Image;
    cities:Phaser.Group;

    // rocketSpeed = 10;
    // missileSpeed = 10000;
    // missileDelay = 10000;

    silo1:GameModule.Silo;
    silo2:GameModule.Silo;


    constructor(game:Phaser.Game) {
      super();
      this.game = game;
    }

    create(){
      this.game.stage.smoothed = false;
      this.game.add.image(0, 0, 'sky');
      this.rocketsBitmap = this.game.add.bitmapData(800, 600);
      this.missilesBitmap = this.game.add.bitmapData(800, 600);
      this.explosionsBitmap = this.game.add.bitmapData(800, 600);
      this.rocketsLayer = this.game.add.image(0, 0, this.rocketsBitmap);
      this.missilesLayer = this.game.add.image(0, 0, this.missilesBitmap);
      this.explosionsLayer = this.game.add.image(0, 0, this.explosionsBitmap);

      this.land = this.add.image(0, 432, 'land');
      this.cities = this.add.group();

      this.cities.add(new GameModule.Sprite.City(this, 8));
      this.cities.add(new GameModule.Sprite.City(this, 168));
      this.cities.add(new GameModule.Sprite.City(this, 246));
      this.cities.add(new GameModule.Sprite.City(this, 324));
      this.cities.add(new GameModule.Sprite.City(this, 402));
      this.cities.add(new GameModule.Sprite.City(this, 568));

      this.silo1 = new GameModule.Silo(this.game, 118,1);
      this.silo2 = new GameModule.Silo(this.game, 518,2);
      this.missileLauncher = new GameModule.MissileLauncher(this.game, this.missilesBitmap, this.cities);
      this.rocketLauncher = new GameModule.RocketLauncher(this.game, this.rocketsBitmap, this.explosionsBitmap, this.silo1, this.silo2);

      this.missileLauncher.startWave(12, 60, 4);

      this.game.input.onDown.add(this.rocketLauncher.launch, this.rocketLauncher);
    }

    update():void{
      this.rocketsBitmap.clear();
      this.missilesBitmap.clear();
      this.explosionsBitmap.clear();

      this.rocketLauncher.update();
      this.missileLauncher.update();

      this.rocketLauncher.checkCollision(this.missileLauncher.getActiveMissiles());
    }

    quitGame(){
      this.game.state.start('MainMenu');
    }


  }
}
