import { View } from 'curvature/base/View';

import { TileMap } from '../tileMap/TileMap';

export class Actor extends View
{
	speed    = 15;
	template = require('./actor.html');

	constructor(...args)
	{
		super(...args);

		this.world = null;

		this.x = 256;
		this.y = 768;

		this.width  = 64;
		this.height = 64;

		this.boxWidth  = 64;
		this.boxHeight = 64;

		this.directions = 16;

		this.state = 'standing';

		this.gSpeed = 0;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.angle  = 0;

		this.maxGravity = 48;
		this.gravity    = 0;

		this.slopeFactor = 0.01;

		this.falling = true;

		this.sensors = {
			top: false
			, bottom: false
			, left: false
			, right: false
		};

		this.mode = 0;

		this.modes = {
			floor: 0
			, leftWall: 1
			, ceiling: 2
			, rightWall: 3
		};

		this.animationClasses = {};
		this.currentClasses   = null;
	}

	destroy()
	{
	}

	update()
	{
		if(!this.tags.actor)
		{
			return;
		}

		let g = this.gSpeed;

		this.args.animspeed = Math.floor(60 + ( 25 * ((96 - Math.abs(g)) / 32) ));

		if(g)
		{
			const max = 24;
			const abG = Math.abs(g);
			const div = abG > max ? max : abG;

			for(let i = 0; i < div; i++)
			{
				this.iteratePosition(Math.floor(g / div));
			}

			if(Math.abs(g) > 48)
			{
				this.args.state = 'running';
			}
			else
			{
				this.args.state = 'walking';
			}

			if(g > 0)
			{
				this.args.facing = 'facing-right';
			}
			else
			{
				this.args.facing = 'facing-left';
			}
		}
		else
		{
			this.iteratePosition(0);
			this.args.state = 'standing';
		}

		if(this.falling)
		{
			if(this.mode == this.modes.floor)
			{
				this.xSpeed = 0;
				this.ySpeed++;
			}
			else if(this.mode == this.modes.ceiling)
			{
				this.xSpeed = 0;
				this.ySpeed--;
			}
			else if(this.mode == this.modes.leftWall)
			{
				this.xSpeed--;
				this.ySpeed = 0;
			}
			else if(this.mode == this.modes.rightWall)
			{
				this.xSpeed++;
				this.ySpeed = 0;
			}
		}
		else
		{
			this.ySpeed = 0;
			this.xSpeed = 0;
		}

		this.x += this.xSpeed;
		this.y += this.ySpeed;

		this.tags.actor.style({
			'--x': Math.floor(this.x)
			, '--y': Math.floor(this.y)
		});

		if(this.mode === this.modes.floor)
		{
			this.tags.actor.style({'--angle': this.angle});
		}
		else if(this.mode === this.modes.leftWall)
		{
			this.tags.actor.style({'--angle': this.angle + 1 * (Math.PI / 2)});
		}
		else if(this.mode === this.modes.ceiling)
		{
			this.tags.actor.style({'--angle': this.angle + 2 * (Math.PI / 2)});
		}
		else if(this.mode === this.modes.rightWall)
		{
			this.tags.actor.style({'--angle': this.angle + 3 * (Math.PI / 2)});
		}

		const angle = Math.round(this.angle * 1000) / 1000;

		if(angle > Math.PI / 4 && angle < 2 * Math.PI / 4)
		{
			if(this.mode === this.modes.floor)
			{
				this.args.mode = this.mode = this.modes.leftWall;
			}
			else if(this.mode === this.modes.leftWall)
			{
				this.args.mode = this.mode = this.modes.ceiling;
			}
			else if(this.mode === this.modes.ceiling)
			{
				this.args.mode = this.mode = this.modes.rightWall;
			}
			else if(this.mode === this.modes.rightWall)
			{
				this.args.mode = this.mode = this.modes.floor;
			}
		}

		if(angle < -Math.PI / 4 && angle > -2 * Math.PI / 4)
		{
			if(this.mode === this.modes.floor)
			{
				this.args.mode = this.mode = this.modes.rightWall;
			}
			else if(this.mode === this.modes.rightWall)
			{
				this.args.mode = this.mode = this.modes.ceiling;
			}
			else if(this.mode === this.modes.ceiling)
			{
				this.args.mode = this.mode = this.modes.leftWall;
			}
			else if(this.mode === this.modes.leftWall)
			{
				this.args.mode = this.mode = this.modes.floor;
			}
		}
	}

	iteratePosition(speed)
	{
		const sin = Math.sin(this.angle);
		const cos = Math.cos(this.angle);

		if(this.mode === this.modes.floor)
		{
			this.x += speed * cos;
			this.y += speed * sin
		}
		else if(this.mode === this.modes.rightWall)
		{
			this.x += speed * sin
			this.y -= speed * cos;
		}
		else if(this.mode === this.modes.ceiling)
		{
			this.x -= speed * cos;
			this.y -= speed * sin;
		}
		else if(this.mode === this.modes.leftWall)
		{
			this.x -= speed * sin;
			this.y += speed * cos;
		}

		const center = this.center;

		const top    = this.top;
		const bottom = this.bottom;
		const left   = this.left;
		const right  = this.right;

		let arm, leg, sensorLeft, sensorRight, sensorSpread;

		if(this.mode == this.modes.floor || this.mode == this.modes.ceiling)
		{
			arm = right  - center[0];
			leg = bottom - center[1];
		}
		else if(this.mode == this.modes.leftWall || this.mode == this.modes.rightWall)
		{
			arm = right  - center[1];
			leg = bottom - center[0];
		}

		sensorLeft  = this.left  - arm * sin + (arm / 2);
		sensorRight = this.right - arm * sin - (arm / 2);

		sensorSpread = Math.abs(sensorRight - sensorLeft);

		const map = this.viewport.tileMap;

		let leftScan  = 0;
		let rightScan = 0;

		let scanLX, scanLY, scanRX, scanRY;

		let leftSolid = false, rightSolid = false;

		const scans = [[0, this.height], [-this.height, this.height]];

		regress: for(let i in scans)
		{
			leftScan = scans[i][0];

			while(leftScan < scans[i][1])
			{
				if(this.mode == this.modes.floor)
				{
					scanLX = sensorLeft;
					scanLY = bottom + leftScan;
				}
				else if(this.mode == this.modes.ceiling)
				{
					scanLX = sensorLeft;
					scanLY = bottom - leftScan;
				}
				else if(this.mode == this.modes.leftWall)
				{
					scanLX = bottom - leftScan;
					scanLY = sensorLeft;
				}
				else if(this.mode == this.modes.rightWall)
				{
					scanLX = bottom + leftScan;
					scanLY = sensorLeft;
				}

				const leftTile   = map.coordsToTile(scanLX, scanLY);
				const leftTileNo = map.getTileNumber(...leftTile);

				if(leftTileNo === false)
				{
					break;
				}

				leftSolid = map.getSolid(leftTileNo, scanLX, scanLY);

				if(leftSolid)
				{
					if(leftScan !== 0)
					{
						break regress;
					}

					break;
				}

				leftScan++;
			}
		}

		regress: for(let i in scans)
		{
			rightScan = scans[i][0];

			while(rightScan < scans[i][1])
			{
				if(this.mode == this.modes.floor)
				{
					scanRX = sensorRight;
					scanRY = bottom + rightScan;
				}
				else if(this.mode == this.modes.ceiling)
				{
					scanRX = sensorRight;
					scanRY = bottom - rightScan;
				}
				else if(this.mode == this.modes.leftWall)
				{
					scanRX = bottom - rightScan;
					scanRY = sensorRight;
				}
				else if(this.mode == this.modes.rightWall)
				{
					scanRX = bottom + rightScan;
					scanRY = sensorRight;
				}

				const rightTile   = map.coordsToTile(scanRX, scanRY);
				const rightTileNo = map.getTileNumber(...rightTile);

				if(rightTileNo === false)
				{
					break;
				}

				rightSolid = map.getSolid(rightTileNo, scanRX, scanRY);

				if(rightSolid)
				{
					break;
				}

				rightScan++;
			}
		}


		this.falling = false;

		if((!leftSolid && !rightSolid) || (leftScan >=0 && rightScan > 0))
		{
			this.falling = true;
		}

		this.angle = Math.atan((rightScan - leftScan) / sensorSpread );

		if((leftSolid && rightSolid) && (leftScan < 0 && rightScan < 0))
		{
			const offset = ((leftScan + rightScan) / 2);
			// const offset = ((leftScan + rightScan) / 2) * Math.cos(this.angle);

			if(this.mode == this.modes.floor)
			{
				this.y += Math.ceil(offset);
			}
			else if(this.mode == this.modes.ceiling)
			{
				this.y -= Math.ceil(offset);
			}
			else if(this.mode == this.modes.leftWall)
			{
				this.x -= offset;
			}
			else if(this.mode == this.modes.rightWall)
			{
				this.x += offset;
			}
		}
	}

	isColliding(actor)
	{
	}

	animate(aniation)
	{
	}

	animate()
	{
		if(!this.animationClasses[animation])
		{
			return;
		}

		if(this.currentClasses == this.animationClasses[animation])
		{
			return;
		}

		this.currentClasses.map(function(remClass){
			this.tags.sprite.removeClass(remClass);
		});

		this.animationClasses[animation].map(function(newClass){
			this.tags.sprite.addClass(newClass);
		});

		this.currentClasses = this.animationClasses[animation];
	}

	roundAngle(angle, segments)
	{
		angle = Math.round(angle * (180/Math.PI));

		var rAngle = `Math.round`(
			angle / (360/segments)
		) * 360/segments;

		return (rAngle * (Math.PI/180));
	}

	goLeft()
	{
		this.gSpeed = -this.speed;
	}

	goRight()
	{
		this.gSpeed = this.speed;
	}

	get center()
	{
		return [
			this.x+this.boxWidth/2
			, this.y+this.boxHeight/2
		];
	}

	get left()
	{
		if(this.mode == this.modes.floor)
		{
			return this.center[0] - (this.width/2);
		}
		else if(this.mode == this.modes.ceiling)
		{
			return this.center[0] + (this.width/2);
		}
		else if(this.mode == this.modes.leftWall)
		{
			return this.center[1] - (this.width/2);
		}
		else if(this.mode == this.modes.rightWall)
		{
			return this.center[1] + (this.width/2);
		}
	}

	get right()
	{
		if(this.mode == this.modes.floor)
		{
			return this.center[0] + (this.width/2);
		}
		else if(this.mode == this.modes.ceiling)
		{
			return this.center[0] - (this.width/2);
		}
		else if(this.mode == this.modes.leftWall)
		{
			return this.center[1] + (this.width/2);
		}
		else if(this.mode == this.modes.rightWall)
		{
			return this.center[1] - (this.width/2);
		}
	}

	get top()
	{
		if(this.mode == this.modes.floor)
		{
			return this.center[1] - Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.ceiling)
		{
			return this.center[1] + Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.leftWall)
		{
			return this.center[0] + Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.rightWall)
		{
			return this.center[0] - Math.floor(this.height/2);
		}
	}

	get bottom()
	{
		if(this.mode == this.modes.floor)
		{
			return this.center[1] + Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.ceiling)
		{
			return this.center[1] - Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.leftWall)
		{
			return this.center[0] - Math.floor(this.height/2);
		}
		else if(this.mode == this.modes.rightWall)
		{
			return this.center[0] + Math.floor(this.height/2);
		}
	}
}
