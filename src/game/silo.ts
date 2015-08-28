module GameModule{
  export class Silo{
    game:Phaser.Game;
    launchX:number;
    launchY:number;
    armory:number;
    counter:Phaser.Text;
    idx:number;

    constructor(game:Phaser.Game,x:number,idx:number){
      this.game = game;
    	this.launchX = x;
    	this.launchY = 432;
    	this.armory = 15;
    	this.counter = this.game.add.text(x - 6, 466, this.armory.toString(), { font: '10px Arial', fill: '#ffffff' });
      this.idx = idx;
      return this;
    }

    launch(){
      this.armory--;
  		this.counter.text = this.armory.toString();
    }

  }
}
