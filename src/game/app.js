var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameModule;
(function (GameModule) {
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main() {
            _super.call(this, 640, 480, Phaser.CANVAS, 'game');
            this.state.add('Boot', GameModule.State.Boot, false);
            this.state.add('Preloader', GameModule.State.Preloader, false);
            this.state.add('MainMenu', GameModule.State.MainMenu, false);
            this.state.add('Game', GameModule.State.Game, false);
            this.state.start('Boot');
        }
        Main.score = 0;
        Main.music = null;
        Main.orientated = false;
        return Main;
    })(Phaser.Game);
    GameModule.Main = Main;
})(GameModule || (GameModule = {}));
window.onload = function () {
    var game = new GameModule.Main();
};
var GameModule;
(function (GameModule) {
    var Explosion = (function () {
        function Explosion(launcher) {
            this.launcher = launcher;
            this.game = launcher.game;
            this.bmd = launcher.explosionBMD;
            this.circle = new Phaser.Circle();
            this.alive = false;
            this.maxRadius = 60;
            this.speed = 1200;
            this.data = null;
            this.index = 0;
            this.hsvindex = 0;
            this.strike = launcher.strike;
            return this;
        }
        Explosion.prototype.explode = function (x, y) {
            this.circle.setTo(x, y, 1);
            var tween = this.game.make.tween(this.circle).to({ radius: this.maxRadius }, this.speed, Phaser.Easing.Linear.None);
            tween.yoyo(true);
            this.alive = true;
            this.data = tween.generateData(60);
            this.index = 0;
            this.hsvindex = 0;
            this.strike.play('exploding');
        };
        Explosion.prototype.update = function () {
            if (this.alive) {
                this.bmd.context.fillStyle = this.launcher.hsv[this.hsvindex];
                this.bmd.context.beginPath();
                this.bmd.context.arc(this.circle.x, this.circle.y, this.circle.radius, 0, Math.PI * 2, false);
                this.bmd.context.closePath();
                this.bmd.context.fill();
                this.hsvindex++;
                if (this.hsvindex === 360) {
                    this.hsvindex = 0;
                }
                this.index++;
                if (this.index === this.data.length) {
                    this.alive = false;
                }
                else {
                    this.circle.radius = this.data[this.index].radius;
                }
            }
        };
        Explosion.prototype.checkCollision = function (missiles) {
            for (var i = 0; i < missiles.length; i++) {
                if (this.circle.contains(missiles[i].x, missiles[i].y) && missiles[i].alive) {
                    this.launcher.addExplosion(missiles[i].x, missiles[i].y);
                    missiles[i].explode();
                }
            }
        };
        return Explosion;
    })();
    GameModule.Explosion = Explosion;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var Missile = (function () {
        function Missile(launcher) {
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
        Missile.prototype.launch = function (target, speed, delay) {
            if (delay > 0) {
            }
            this.target = target;
            var x = this.game.world.randomX;
            this.line.setTo(x, 0, x, 0);
            this.speed = Math.floor(Phaser.Math.distance(this.line.start.x, this.line.start.y, target.hitX, target.hitY) * speed);
            var tween = this.game.make.tween(this.line.end)
                .to({ x: target.hitX, y: target.hitY }, this.speed, Phaser.Easing.Linear.None);
            this.data = tween.generateData(60);
            this.index = 0;
            this.line.end.set(this.data[this.index].x, this.data[this.index].y);
            this.alive = true;
        };
        Missile.prototype.update = function () {
            if (this.alive) {
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
                if (this.index === this.data.length) {
                    this.alive = false;
                    this.target.nuked();
                }
                else {
                    this.line.end.x = this.data[this.index].x;
                    this.line.end.y = this.data[this.index].y;
                }
            }
        };
        Missile.prototype.explode = function () {
            this.alive = false;
        };
        Object.defineProperty(Missile.prototype, "x", {
            get: function () {
                return this.line.end.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Missile.prototype, "y", {
            get: function () {
                return this.line.end.y;
            },
            enumerable: true,
            configurable: true
        });
        return Missile;
    })();
    GameModule.Missile = Missile;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var MissileLauncher = (function () {
        function MissileLauncher(game, bmd, cities) {
            this.game = game;
            this.bmd = bmd;
            this.cities = cities;
            this.missiles = [];
            this.total = 15;
            this.speed = 15;
            return this;
        }
        MissileLauncher.prototype.startWave = function (total, speed, starting) {
            this.total = total;
            this.speed = speed;
            this.launch(4, 0);
            this.game.time.events.add(4000, this.launch, this, 4, 0);
            this.game.time.events.add(4000, this.launch, this, 4, 250);
        };
        MissileLauncher.prototype.launch = function (qty, delay) {
            for (var i = 0; i < qty; i++) {
                this.getMissile().launch(this.cities.getRandom(), this.speed, delay);
                this.total--;
                if (this.total === 0) {
                    console.log('wave over');
                }
            }
        };
        MissileLauncher.prototype.getMissile = function () {
            for (var i = 0; i < this.missiles.length; i++) {
                if (this.missiles[i].alive === false) {
                    return this.missiles[i];
                }
            }
            var missile = new GameModule.Missile(this);
            this.missiles.push(missile);
            return missile;
        };
        MissileLauncher.prototype.update = function () {
            for (var i = 0; i < this.missiles.length; i++) {
                if (this.missiles[i].alive) {
                    this.missiles[i].update();
                }
            }
        };
        MissileLauncher.prototype.getActiveMissiles = function () {
            var output = [];
            for (var i = 0; i < this.missiles.length; i++) {
                if (this.missiles[i].alive) {
                    output.push(this.missiles[i]);
                }
            }
            return output;
        };
        return MissileLauncher;
    })();
    GameModule.MissileLauncher = MissileLauncher;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var Rocket = (function () {
        function Rocket(launcher) {
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
            this.strike = launcher.strike;
            return this;
        }
        Rocket.prototype.launch = function (silo, destX, destY, speed) {
            this.silo = silo;
            this.destX = destX;
            this.destY = destY;
            this.line.setTo(silo.launchX, silo.launchY, silo.launchX, silo.launchY);
            this.speed = Math.floor(Phaser.Math.distance(this.line.start.x, this.line.start.y, destX, destY) * speed);
            var tween = this.game.make.tween(this.line.end).to({ x: this.destX, y: this.destY }, this.speed, Phaser.Easing.Linear.None);
            this.data = tween.generateData(60);
            this.index = 0;
            this.alive = true;
            this.strike.play('launching');
        };
        Rocket.prototype.update = function () {
            if (this.alive) {
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
                if (this.index === this.data.length) {
                    this.alive = false;
                    this.launcher.addExplosion(this.line.end.x, this.line.end.y);
                }
                else {
                    this.line.end.x = this.data[this.index].x;
                    this.line.end.y = this.data[this.index].y;
                }
            }
        };
        return Rocket;
    })();
    GameModule.Rocket = Rocket;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var RocketLauncher = (function () {
        function RocketLauncher(game, bmd1, bmd2, silo1, silo2) {
            this.game = game;
            this.rocketsBMD = bmd1;
            this.explosionBMD = bmd2;
            this.rocketSpeed = 4;
            this.silo1 = silo1;
            this.silo2 = silo2;
            this.rockets = [];
            this.explosions = [];
            this.hsv = this.getHSVColorWheel();
            this.strike = this.game.add.audio('strike');
            this.strike.addMarker('launching', 0.9, 2.0, 5, false);
            this.strike.addMarker('exploding', 5.0, 7.0, 0.5, false);
            return this;
        }
        RocketLauncher.prototype.launch = function (pointer) {
            var rocket = this.getRocket();
            if (pointer.x < 320 && this.silo1.armory > 0) {
                rocket.launch(this.silo1, pointer.x, pointer.y, this.rocketSpeed);
            }
            else if (this.silo2.armory > 0) {
                rocket.launch(this.silo2, pointer.x, pointer.y, this.rocketSpeed);
            }
        };
        RocketLauncher.prototype.getRocket = function () {
            for (var i = 0; i < this.rockets.length; i++) {
                if (this.rockets[i].alive === false) {
                    return this.rockets[i];
                }
            }
            var rocket = new GameModule.Rocket(this);
            this.rockets.push(rocket);
            return rocket;
        };
        RocketLauncher.prototype.addExplosion = function (x, y) {
            this.getExplosion().explode(x, y);
        };
        RocketLauncher.prototype.getExplosion = function () {
            for (var i = 0; i < this.explosions.length; i++) {
                if (this.explosions[i].alive === false) {
                    return this.explosions[i];
                }
            }
            var explosion = new GameModule.Explosion(this);
            this.explosions.push(explosion);
            return explosion;
        };
        RocketLauncher.prototype.update = function () {
            for (var i = 0; i < this.rockets.length; i++) {
                if (this.rockets[i].alive) {
                    this.rockets[i].update();
                }
            }
            for (var i = 0; i < this.explosions.length; i++) {
                if (this.explosions[i].alive) {
                    this.explosions[i].update();
                }
            }
        };
        RocketLauncher.prototype.checkCollision = function (missiles) {
            if (missiles.length === 0) {
                return;
            }
            for (var i = 0; i < this.explosions.length; i++) {
                if (this.explosions[i].alive) {
                    this.explosions[i].checkCollision(missiles);
                }
            }
        };
        RocketLauncher.prototype.getHSVColorWheel = function (alpha) {
            alpha = alpha || 255;
            var colors = [];
            for (var c = 0; c <= 359; c++) {
                colors[c] = Phaser.Color.getWebRGB(this.HSVtoRGB(c, 1.0, 1.0, alpha));
            }
            return colors;
        };
        RocketLauncher.prototype.HSVtoRGB = function (h, s, v, alpha) {
            if (typeof alpha === "undefined") {
                alpha = 255;
            }
            var result;
            if (s == 0.0) {
                result = Phaser.Color.getColor32(alpha, v * 255, v * 255, v * 255);
            }
            else {
                h = h / 60.0;
                var f = h - Math.floor(h);
                var p = v * (1.0 - s);
                var q = v * (1.0 - s * f);
                var t = v * (1.0 - s * (1.0 - f));
                switch (Math.floor(h)) {
                    case 0:
                        result = Phaser.Color.getColor32(alpha, v * 255, t * 255, p * 255);
                        break;
                    case 1:
                        result = Phaser.Color.getColor32(alpha, q * 255, v * 255, p * 255);
                        break;
                    case 2:
                        result = Phaser.Color.getColor32(alpha, p * 255, v * 255, t * 255);
                        break;
                    case 3:
                        result = Phaser.Color.getColor32(alpha, p * 255, q * 255, v * 255);
                        break;
                    case 4:
                        result = Phaser.Color.getColor32(alpha, t * 255, p * 255, v * 255);
                        break;
                    case 5:
                        result = Phaser.Color.getColor32(alpha, v * 255, p * 255, q * 255);
                        break;
                }
            }
            return result;
        };
        return RocketLauncher;
    })();
    GameModule.RocketLauncher = RocketLauncher;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var Silo = (function () {
        function Silo(game, x, idx) {
            this.game = game;
            this.launchX = x;
            this.launchY = 432;
            this.armory = 15;
            this.counter = this.game.add.text(x - 6, 466, this.armory.toString(), { font: '10px Arial', fill: '#ffffff' });
            this.idx = idx;
            return this;
        }
        Silo.prototype.launch = function () {
            this.armory--;
            this.counter.text = this.armory.toString();
        };
        return Silo;
    })();
    GameModule.Silo = Silo;
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var Sprite;
    (function (Sprite) {
        var City = (function (_super) {
            __extends(City, _super);
            function City(state, x) {
                this.game = state.game;
                this.state = state;
                this.xval = x;
                this.yval = 400;
                _super.call(this, this.game, this.xval, this.yval, 'city', 0);
                this.hitX = this.xval + 32;
                this.hitY = this.yval + 30;
                return this;
            }
            City.prototype.nuked = function () {
                this.frame = 1;
                this.alive = false;
            };
            return City;
        })(Phaser.Sprite);
        Sprite.City = City;
    })(Sprite = GameModule.Sprite || (GameModule.Sprite = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Boot = (function (_super) {
            __extends(Boot, _super);
            function Boot(game) {
                _super.call(this);
                this.game = game;
                GameModule.Main.score = 0;
                GameModule.Main.music = null;
                GameModule.Main.orientated = false;
            }
            Boot.prototype.preload = function () {
                this.game.load.image('preloaderBar', 'asset/image/loader.png');
                var titleimg = this.game.load.image('phaser', 'asset/image/phaser.png');
            };
            Boot.prototype.create = function () {
                this.game.physics.startSystem(Phaser.Physics.ARCADE);
                this.game.input.maxPointers = 1;
                if (this.game.device.desktop) {
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.minWidth = 320;
                    this.scale.minHeight = 240;
                    this.scale.maxWidth = 640;
                    this.scale.maxHeight = 480;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.refresh();
                }
                else {
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                    this.scale.minWidth = 480;
                    this.scale.minHeight = 260;
                    this.scale.maxWidth = 1024;
                    this.scale.maxHeight = 768;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.pageAlignVertically = true;
                    this.scale.forceOrientation(true, false);
                    this.scale.setResizeCallback(this.gameResized, this);
                    this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
                    this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
                    this.game.scale.refresh();
                }
                this.game.state.start('Preloader');
            };
            Boot.prototype.gameResized = function (width, height) {
            };
            Boot.prototype.enterIncorrectOrientation = function () {
                GameModule.Main.orientated = false;
                document.getElementById('orientation').style.display = 'block';
            };
            Boot.prototype.leaveIncorrectOrientation = function () {
                GameModule.Main.orientated = true;
                document.getElementById('orientation').style.display = 'none';
            };
            return Boot;
        })(Phaser.State);
        State.Boot = Boot;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Game = (function (_super) {
            __extends(Game, _super);
            function Game(game) {
                _super.call(this);
                this.game = game;
            }
            Game.prototype.create = function () {
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
                this.silo1 = new GameModule.Silo(this.game, 118, 1);
                this.silo2 = new GameModule.Silo(this.game, 518, 2);
                this.missileLauncher = new GameModule.MissileLauncher(this.game, this.missilesBitmap, this.cities);
                this.rocketLauncher = new GameModule.RocketLauncher(this.game, this.rocketsBitmap, this.explosionsBitmap, this.silo1, this.silo2);
                this.missileLauncher.startWave(12, 60, 4);
                this.game.input.onDown.add(this.rocketLauncher.launch, this.rocketLauncher);
            };
            Game.prototype.update = function () {
                this.rocketsBitmap.clear();
                this.missilesBitmap.clear();
                this.explosionsBitmap.clear();
                this.rocketLauncher.update();
                this.missileLauncher.update();
                this.rocketLauncher.checkCollision(this.missileLauncher.getActiveMissiles());
            };
            Game.prototype.quitGame = function () {
                this.game.state.start('MainMenu');
            };
            return Game;
        })(Phaser.State);
        State.Game = Game;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var MainMenu = (function (_super) {
            __extends(MainMenu, _super);
            function MainMenu(game) {
                _super.call(this);
                this.music = null;
                this.playButton = null;
                this.game = game;
            }
            MainMenu.prototype.create = function () {
                var titleimage = this.game.cache.getImage('titlepage');
                var xpos = this.game.width / 2 - (titleimage ? titleimage.width / 2 : 200);
                var ypos = this.game.height / 2 - (titleimage ? titleimage.height / 2 : 25);
                this.add.sprite(xpos > 0 ? xpos : 0, ypos > 0 ? ypos : 0, 'titlepage');
                this.game.input.onDown.addOnce(this.startGame, this);
            };
            MainMenu.prototype.startGame = function () {
                this.game.state.start('Game');
            };
            return MainMenu;
        })(Phaser.State);
        State.MainMenu = MainMenu;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
var GameModule;
(function (GameModule) {
    var State;
    (function (State) {
        var Preloader = (function (_super) {
            __extends(Preloader, _super);
            function Preloader(game) {
                _super.call(this);
                this.background = null;
                this.preloadBar = null;
                this.ready = false;
                this.game = game;
            }
            Preloader.prototype.preload = function () {
                var bg = this.game.add.image(0, 0, 'phaser');
                bg.height = this.game.height;
                bg.width = this.game.width;
                var preloadbar = this.game.cache.getImage('preloaderBar');
                var xpos = 0;
                var ypos = 0;
                xpos = this.game.width / 2 - (preloadbar ? preloadbar.width / 2 : 200);
                ypos = this.game.height / 2 - (preloadbar ? preloadbar.height / 2 : 25);
                this.preloadBar = this.game.add.sprite(xpos > 0 ? xpos : 0, ypos > 0 ? ypos : 0, 'preloaderBar');
                this.game.load.setPreloadSprite(this.preloadBar);
                this.game.load.image('titlepage', 'asset/image/title-page.png');
                this.game.load.image('land', 'asset/image/land.png');
                this.game.load.image('marker', 'asset/image/marker.png');
                this.game.load.image('missile', 'asset/image/missile.png');
                this.game.load.image('sky', 'asset/image/sky.png');
                this.game.load.spritesheet('city', 'asset/image/city.png', 64, 36);
                this.game.load.audio("strike", ["/asset/sound/missile-strike.ogg",
                    "/asset/sound/missile-strike.wav",
                    "/asset/sound/missile-strike.mp3"]);
            };
            Preloader.prototype.create = function () {
                this.game.state.start('MainMenu');
            };
            return Preloader;
        })(Phaser.State);
        State.Preloader = Preloader;
    })(State = GameModule.State || (GameModule.State = {}));
})(GameModule || (GameModule = {}));
