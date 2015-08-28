module GameModule{
  export class Rocket{

    game:Phaser.Game;
    launcher:GameModule.RocketLauncher;
    bmd:Phaser.BitmapData;

    destX:number;
    destY:number;
    line:Phaser.Line;
    speed:number;
    silo:GameModule.Silo;
    data:any[];
    index:number;
    alive:boolean;

    strike:Phaser.Sound;

    constructor(launcher:GameModule.RocketLauncher){
      this.game = launcher.game;
      this.launcher = launcher;
    	this.game = launcher.game;
    	this.bmd = launcher.rocketsBMD;

    	this.destX = 0;
    	this.destY = 0;

    	this.line = new Phaser.Line();
    	this.alive = false;
    	this.speed = 1;

    	this.silo = null;
    	this.data = null;
    	this.index = 0;

      //this.strike = this.game.add.audio('strike');
      //this.strike.addMarker('launching',0.9,4.2,1,false);
      this.strike = launcher.strike;

      return this;
    }

    launch(silo:GameModule.Silo, destX:number, destY:number, speed:number):void{
      this.silo = silo;
      this.destX = destX;
      this.destY = destY;

      this.line.setTo(silo.launchX, silo.launchY, silo.launchX, silo.launchY);
      this.speed = Math.floor(Phaser.Math.distance(this.line.start.x, this.line.start.y, destX, destY) * speed);
      var tween = this.game.make.tween(this.line.end).to( { x: this.destX, y: this.destY }, this.speed, Phaser.Easing.Linear.None);
      this.data = tween.generateData(60);
      this.index = 0;
      this.alive = true;

      //console.log("launching");

      this.strike.play('launching');
    }

    update():void{
      if (this.alive){
        this.bmd.draw('marker', this.destX - 4, this.destY - 4);
        this.bmd.context.strokeStyle = '#0000ff';
        this.bmd.context.lineWidth = 1;
        this.bmd.context.beginPath();
        this.bmd.context.moveTo(this.line.start.x, this.line.start.y);
        this.bmd.context.lineTo(this.line.end.x, this.line.end.y);
        this.bmd.context.closePath();
        this.bmd.context.stroke();
        this.bmd.context.fillStyle = '#ffffff';
        this.bmd.context.fillRect(this.line.end.x, this.line.end.y, 1, 1);

        this.index++;
        console.log(this.index);
        if (this.index === this.data.length){
          this.alive = false;
          this.launcher.addExplosion(this.line.end.x, this.line.end.y);
        }
        else{
          this.line.end.x = this.data[this.index].x;
          this.line.end.y = this.data[this.index].y;
        }
      }
    }

  }
}
