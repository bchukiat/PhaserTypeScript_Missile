module GameModule{
  export class MissileLauncher{
    game:Phaser.Game;
    bmd:Phaser.BitmapData;
    cities:Phaser.Group;
    missiles:GameModule.Missile[];
    total:number;
    speed:number;

    constructor(game, bmd, cities){
      this.game = game;
    	this.bmd = bmd;
    	this.cities = cities;
    	this.missiles = [];
    	this.total = 15;
    	this.speed = 15;

    	return this;
    }

    startWave(total, speed, starting){
      this.total = total;
  		this.speed = speed;
  		this.launch(4, 0);
      this.game.time.events.add(4000, this.launch, this, 4, 0);
  	  this.game.time.events.add(4000, this.launch, this, 4, 250);
    }

    launch(qty, delay){
      for (var i = 0; i < qty; i++){
  			this.getMissile().launch(this.cities.getRandom(), this.speed, delay);
  			this.total--;

  			if (this.total === 0){
  				console.log('wave over');
  			}
  		}
    }

    getMissile(){
      for (var i = 0; i < this.missiles.length; i++){
  			if (this.missiles[i].alive === false){
  				return this.missiles[i];
  			}
  		}

  		//	Got this far? We need a new missile
  		var missile = new GameModule.Missile(this);
  		this.missiles.push(missile);

  		return missile;
    }

    update(){
      for (var i = 0; i < this.missiles.length; i++){
  			if (this.missiles[i].alive){
  				this.missiles[i].update();
  			}
  		}
    }

    getActiveMissiles(){
      var output = [];
  		for (var i = 0; i < this.missiles.length; i++){
  			if (this.missiles[i].alive){
  				output.push(this.missiles[i]);
  			}
  		}
  		return output;
    }



  }
}
