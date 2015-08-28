module GameModule{
  export class Missile{
    game:Phaser.Game;
    launcher:GameModule.MissileLauncher;
    bmd:Phaser.BitmapData;
    destX:number;
    destY:number;
    line:Phaser.Line;
    pending:boolean;
    alive:boolean;
    speed:number;
    target:GameModule.Sprite.City;
    data:any[];
    index:number;

    constructor(launcher:GameModule.MissileLauncher){
      this.launcher = launcher;
      this.game = launcher.game;
      this.bmd = launcher.bmd;
      this.destX = 0;
      this.destY = 0;
      this.line = new Phaser.Line();
      this.pending = true;
      this.alive = false;
      this.speed = 1;
      this.target = null;
    	this.data = null;
    	this.index = 0;

      return this;
    }

    launch(target, speed, delay){
      if (delay > 0){
  			//	start timer here
  		}
  		this.target = target;
      var x = this.game.world.randomX;
      this.line.setTo(x, 0, x, 0);
      this.speed = Math.floor(
        Phaser.Math.distance(
          this.line.start.x,
          this.line.start.y,
          target.hitX,
          target.hitY
        ) * speed);
      var tween = this.game.make.tween(this.line.end)
        .to(
          { x: target.hitX, y: target.hitY },
          this.speed, Phaser.Easing.Linear.None
        );
      this.data = tween.generateData(60);
      this.index = 0;
      this.line.end.set(this.data[this.index].x, this.data[this.index].y);
      this.alive = true;
    }

    update(){
      if (this.alive){
  			this.bmd.context.strokeStyle = '#ff0000';
        this.bmd.context.lineWidth = 1;
        this.bmd.context.beginPath();
        this.bmd.context.moveTo(this.line.start.x, this.line.start.y);
        this.bmd.context.lineTo(this.line.end.x, this.line.end.y);
        this.bmd.context.closePath();
        this.bmd.context.stroke();
        this.bmd.context.fillStyle = '#ffffff';
        this.bmd.context.fillRect(this.line.end.x, this.line.end.y, 1, 1);
  			this.index++;

  			if (this.index === this.data.length){
  				this.alive = false;

  				this.target.nuked();
  			}
  			else{
  				this.line.end.x = this.data[this.index].x;
  				this.line.end.y = this.data[this.index].y;
  			}

  		}
    }

    explode(){
      //console.log('missile exploded');
  		this.alive = false;
    }

    get x():number {
        return this.line.end.x;
    }
    get y():number {
        return this.line.end.y;
    }

  }
}
