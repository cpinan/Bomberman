var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 352;

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Resources
var wall = new Image();
wall.src = "resources/wall.gif";

var bomb = new Image();
bomb.src = "resources/bomb.png";

var bomberman = new Image();
bomberman.src = "resources/bomberman.png";

// Settings
var tileSize = 32;
var BOMB_STATES = { LOAD: "loading", BOOM: "boom", END: "end" };
var bombsHistory = [];

// Map

var map = new Array();
map[0]  = new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);
map[1]  = new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,1);
map[2]  = new Array(1,0,1,0,1,0,1,0,1,0,1,0,1,0,1);
map[3]  = new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,1);
map[4]  = new Array(1,0,1,0,1,0,1,0,1,0,1,0,1,0,1);
map[5]  = new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,1);
map[6]  = new Array(1,0,1,0,1,0,1,0,1,0,1,0,1,0,1);
map[7]  = new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,1);
map[8]  = new Array(1,0,1,0,1,0,1,0,1,0,1,0,1,0,1);
map[9]  = new Array(1,0,0,0,0,0,0,0,0,0,0,0,0,0,1);
map[10] = new Array(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1);

var Map = function()
{
	this.draw = function()
	{
		context.save();

		var row, col;

		for(row = 0; row < map.length; row++)
		{
			for(col = 0; col < map[0].length; col++)
			{
				var celda = map[row][col];
				if(celda == 1)
					context.drawImage(wall, col * tileSize, row * tileSize, tileSize, tileSize);
			}
		}

		context.restore();
	};

	this.update = function(dt)
	{

	};

};

// Player
var Player = function()
{
	var maxBombs = 5;
	var arrayBombs = [];
	var isMoving = false;
	var nextX = 0, nextY = 0;
	var dX = 0, dY = 0;
	var movingTime = tileSize * 0.1;
	this.x = 32;
	this.y = 32;

	var STATES = { IDLE: "idle", MOVING: "moving" };

	var ANIM_TIME = 0.2;
	var timerAnim = 0;
	var indexAnim = 0;
	var view = 0; // 0 = bottom, 1 = left, 2 = top, 3 = right
	var state = STATES.IDLE;

	this.createBomb = function(dt)
	{
		if(arrayBombs.length <= maxBombs)
		{

			var x = parseInt((this.x + tileSize * 0.5) / tileSize) * tileSize;
			var y = parseInt((this.y + tileSize * 0.5) / tileSize) * tileSize;

			var create = true;
			if(bombsHistory.length > 0)
			{
				for(var i = 0; i < bombsHistory.length; i++)
				{
					var histBomb = bombsHistory[i];
					if(histBomb != null && histBomb != undefined && histBomb.state == BOMB_STATES.LOAD)
					{
						if(histBomb.x == x && histBomb.y == y)
						{
							create = false;
							break;
						}
					}
				}
			}

			if(create)
			{
				var bomb = new Bomb(x, y);
				arrayBombs.push(bomb);
				bombsHistory.push(bomb);
			}
		}
	};


	this.explodeBomb = function(bomb)
	{
		for(var i = 0; i < arrayBombs.length; i++)
		{
			if(bomb == arrayBombs[i])
				arrayBombs[i].explode();
		}
	}

	this.draw = function()
	{
		context.save();
		var sX = 0, sY = 0;

		switch(view)
		{
			case 0: // bottom
				sY = tileSize * 0;

			break;

			case 1: // left
				sY = tileSize * 3;

			break;

			case 2: // top
				sY = tileSize * 1;

			break;

			case 3: // right
				sY = tileSize * 2;
			break;
		}

		if(isMoving)
			sX = indexAnim * tileSize;

		context.drawImage(bomberman, sX, sY, tileSize, tileSize, this.x, this.y, tileSize, tileSize);
		context.restore();
	};

	this.update = function(dt)
	{

		var i, j;

		if(KEY_STATES.SPACE)
			this.createBomb(dt);

		// Moving time
		if(!isMoving)
		{
			if(KEY_STATES.UP)
			{
				dY = -1;
				view = 2;
			}

			if(KEY_STATES.DOWN)
			{
				dY = 1;
				view = 0;
			}

			if(KEY_STATES.LEFT)
			{
				dX = -1;
				view = 1;
			}

			if(KEY_STATES.RIGHT)
			{
				dX = 1;
				view = 3;
			}
			
			var row, col;
			var posX = this.x + dX;
			var posY = this.y + dY;
			for(row = 0; row < map.length; row++)
			{
				for(col = 0; col < map[0].length; col++)
				{
					var celda = map[row][col];
					if(celda == 1)
					{
						var rCeil = { left: col * tileSize, top: row * tileSize, right: col * tileSize + tileSize, bottom: row * tileSize + tileSize };
						var pCeil = { left: posX, top: posY, right: posX + tileSize, bottom: posY + tileSize};

						if(pCeil.left < rCeil.right && pCeil.top < rCeil.bottom && pCeil.bottom > rCeil.top && pCeil.right > rCeil.left)
						{
							dX = 0;
							dY = 0;
						}

					}
				}
			}
			nextX = this.x + dX * tileSize;
			nextY = this.y + dY * tileSize;

			for(i = 0; i < bombsHistory.length; i++)
			{	
				var histBomb = bombsHistory[i];
				if(histBomb.state == BOMB_STATES.LOAD)
				{
					if(histBomb.x == nextX && histBomb.y == nextY)
					{
						nextX = 0;
						nextY = 0;
						dX = 0;
						dY = 0;
						break;
					}
				}
			}
			
			if(dX != 0 || dY != 0)
				isMoving = true;
		}
		else
		{

			var forecastX = this.x, forecastY = this.y;

			if(dX == -1) // Izquierda
			{

				forecastX = this.x - movingTime;
				if(forecastX <= nextX)
					forecastX = nextX;

			}else if(dX == 1) // Derecha
			{

				forecastX = this.x + movingTime;
				if(forecastX >= nextX)
					forecastX = nextX;

			}else if(dY == -1) // Arriba
			{

				forecastY = this.y - movingTime;
				if(forecastY <= nextY)
					forecastY = nextY;

			}else if(dY == 1) // Abajo
			{

				forecastY = this.y + movingTime;
				if(forecastY >= nextY)
					forecastY = nextY;

			}

			this.x = forecastX;
			this.y = forecastY;

			if(forecastX == nextX && forecastY == nextY)
			{
				isMoving = false;
				nextX = 0;
				nextY = 0;
				dX = 0;
				dY = 0;
			}

		}
		// Finish Moving

		if(arrayBombs.length > 0)
		{
			var tmpBomb = [];

			// Recorriendo las bombas
			for(i = 0; i < arrayBombs.length; i++)
			{
				arrayBombs[i].update(dt);
				if(arrayBombs[i].state == BOMB_STATES.END)
					tmpBomb.push(arrayBombs[i]);
			}

			// Eliminando las bombas
			if(tmpBomb.length > 0)
			{
				for(i = 0; i < tmpBomb.length; i++)
				{
					for(j = arrayBombs.length - 1; j >= 0; j--)
					{
						if(tmpBomb[i] == arrayBombs[j])
						{
							arrayBombs.splice(j, 1);
							break;
						}
					}

					for(j = bombsHistory.length - 1; j >= 0; j--)
					{
						if(tmpBomb[i] == bombsHistory[j])
						{
							bombsHistory.splice(j, 1);
							break;
						}	
					}

				}
			}
		}

		timerAnim += dt;
		if(timerAnim >= ANIM_TIME)
		{
			timerAnim = 0;
			indexAnim++;
			if(indexAnim > 2)
				indexAnim = 0;
		}


	};

};

// Bomb
var Bomb = function(x, y)
{
	this.x = x;
	this.y = y;
	this.state = BOMB_STATES.LOAD;
	this.bombTime = 0;
	this.autoExplode = true;
	this.bombRadius = 5;
	this.previousBombRadius = this.bombRadius;

	var explodeTime = 3;
	var defaultExplodeTime = 10;

	this.explodeArray = [];

	this.draw = function()
	{
		context.save();

		if(this.state == BOMB_STATES.LOAD)
		{
			context.drawImage(bomb, this.x, this.y, tileSize, tileSize);
		}
		else if(this.state == BOMB_STATES.BOOM)
		{
			context.fillStyle = "#FF0000";
			for(var i = 0; i < this.explodeArray.length; i++)
			{
				var x = this.explodeArray[i].x;
				var y = this.explodeArray[i].y;
				context.fillRect(x, y, tileSize, tileSize);
			}
		}


		context.restore();
	};

	this.explode = function()
	{
		if(this.state != BOMB_STATES.BOOM)
		{
			this.bombTime = 0;

			var row, col;
			this.state = BOMB_STATES.BOOM;
			var indexX = parseInt(this.x / tileSize);
			var indexY = parseInt(this.y / tileSize);
			this.explodeArray.push({ x: indexX * tileSize, y: indexY * tileSize });

			for(var cruz = 1; cruz <= 4; cruz++)
			{
				for(var radius = 1; radius <= this.bombRadius; radius++)
				{

					var celda = null;
					var setX = indexX, setY = indexY;

					if(cruz == 1)		// Checar izquierda
						setX = indexX - radius;
					else if(cruz == 2) 	// Checar arriba
						setY = indexY - radius;
					else if(cruz == 3) 	// Checar derecha
						setX = indexX + radius;
					else if(cruz == 4) 	// Checar abajo
						setY = indexY + radius;

					if(setX >= 0 && setY >= 0 && setX < map[0].length && setY < map.length)
						celda = map[setY][setX];

					if(celda != null && celda != undefined)
					{
						if(celda == 0)
						{
							if(setX != indexX || setY != indexY)
							{
								var dataExplode = { x: setX * tileSize, y: setY * tileSize };
								this.explodeArray.push(dataExplode);
							}
						}
						else
						{
							break;
						}
					}

				}
			}

		}
	};

	this.update = function(dt)
	{
		if(this.state == BOMB_STATES.LOAD && this.autoExplode)
		{
			this.bombTime += dt;
			if(this.bombTime >= defaultExplodeTime)
				this.explode();

		}
		else if(this.state == BOMB_STATES.BOOM)
		{
			this.bombTime += dt;
			if(this.bombTime >= explodeTime)
				this.state = BOMB_STATES.END;
		}
	};

};

// Game

var Game = function()
{

	var level = new Map();
	var player = new Player();

	this.init = function()
	{
		requestAnimFrame(game.thread);
	};

	this.draw = function()
	{
		var i;
		context.save();

		context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.fillStyle = "#CCCCCC";
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		level.draw();

		if(bombsHistory.length > 0)
		{
			// Recorriendo las bombas
			for(i = 0; i < bombsHistory.length; i++)
			{
				if(bombsHistory[i].state == BOMB_STATES.LOAD)
					bombsHistory[i].draw();
			}

			// Recorriendo las bombas
			for(i = 0; i < bombsHistory.length; i++)
			{
				if(bombsHistory[i].state == BOMB_STATES.BOOM)
					bombsHistory[i].draw();
			}

		}

		player.draw();

		context.restore();
	};

	this.update = function(dt)
	{

		var i, j, k;

		for(i = 0; i < bombsHistory.length; i++)
		{
			bombsHistory[i].update(dt);
			if(bombsHistory[i].state == BOMB_STATES.BOOM)
			{
				for(j = 0; j < bombsHistory.length; j++)
				{
					if(bombsHistory[j].state == BOMB_STATES.LOAD)
					{
						var array = bombsHistory[i].explodeArray;
						for(k = 0; k < array.length; k++)
						{
							var explodeX = array[k].x;
							var explodeY = array[k].y;

							if(explodeX == bombsHistory[j].x && explodeY == bombsHistory[j].y)
								player.explodeBomb(bombsHistory[j]);
						}
					}
				}
			}

		}

		player.update(dt);

	};


	this.thread = function()
	{
		var now = new Date().getTime(), dt = (1 / (now - (time || now)));
    	time = now;
		game.draw();
		game.update(dt);
		requestAnimFrame(game.thread);
	};

};

var game = new Game();
game.init();