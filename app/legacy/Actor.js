import { View } from 'curvature/base/View';

import { PointDump } from '../debug/PointDump';

export class Actor extends View
{
	speed    = 15;
	template = require('./actor.html');

	constructor(...args)
	{
		super(...args);

		this.world = null;

		this.x = 92;
		this.y = 1024;

		this.width  = 64;
		this.height = 64;

		this.boxWidth  = 64;
		this.boxHeight = 64;

		this.directions = 16;

		this.state = 'standing';

		this.gSpeed    = 0;
		// this.gSpeedMax = 48;
		this.gSpeedMax = 40;
		this.xSpeed    = 0;
		this.ySpeed    = 0;
		this.angle     = 0;

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

		this.mode = this.args.mode = 0;

		this.modes = {
			floor: 0
			, leftWall: 1
			, ceiling: 2
			, rightWall: 3
		};

		this.animationClasses = {};
		this.currentClasses   = null;

		this.pdL = new PointDump({color: 'red'});
		this.pdR = new PointDump({color: 'green'});

		this.args.debugs = [this.pdL, this.pdR];
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

		this.args.animspeed = Math.floor((this.gSpeedMax - Math.abs(g) ) / 12);

		if(this.args.animspeed < 1)
		{
			this.args.animspeed = 1;
		}

		const angle = Math.round(this.angle * 1000) / 1000;

		if(!this.falling)
		{
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

			if(Math.abs(g) > this.gSpeedMax / 2)
			{
				this.args.state = 'running';
			}
			else if(Math.abs(g) > 0)
			{
				this.args.state = 'walking';
			}
			else
			{
				this.args.state = 'standing';
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
		else if(this.falling || this.jumped)
		{
			this.args.state = 'jumping';
		}

		if(this.falling)
		{
			if(this.mode == this.modes.floor)
			{
				this.ySpeed++;
			}
			else if(this.mode == this.modes.ceiling)
			{
				this.ySpeed--;
			}
			else if(this.mode == this.modes.leftWall)
			{
				this.xSpeed--;
			}
			else if(this.mode == this.modes.rightWall)
			{
				this.xSpeed++;
			}
		}
		else if(!this.jumped)
		{
			this.xSpeed = 0;
			this.ySpeed = 0;
		}

		this.x += this.xSpeed;
		this.ySpeed && (this.y += this.ySpeed > 0 ? 1 : -1);

		if(g)
		{
			const max = 8;
			const abG = Math.abs(g);
			const div = abG > max ? max : abG;

			for(let i = 0; i < div; i++)
			{
				this.iteratePosition(Math.floor(g / div));
			}
		}
		else
		{
			this.iteratePosition(0);
		}

		if(this.ySpeed > 32)
		{
			this.ySpeed = 32;
		}

		if(this.ySpeed < -32)
		{
			this.ySpeed = -32;
		}

		if(this.xSpeed > 32)
		{
			this.xSpeed = 32;
		}

		if(this.xSpeed < -32)
		{
			this.xSpeed = -32;
		}

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

		if(this.jumped)
		{
			this.jumped = false;
		}
	}

	iteratePosition(speed)
	{
		let sin = Math.sin(this.angle);
		let cos = Math.cos(this.angle);

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

		sensorLeft  = this.left  - arm * sin + (arm * 0.5);
		sensorRight = this.right - arm * sin - (arm * 0.5);

		sensorSpread = Math.abs(sensorRight - sensorLeft);

		const map = this.viewport.tileMap;

		let leftScan  = 0;
		let rightScan = 0;

		let scanLX, scanLY, scanRX, scanRY;

		let leftSolid = false, rightSolid = false;

		const height = this.falling ? this.height : this.height ;

		const scans = [[-height, 0], [-height, height]];

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

				leftSolid = map.getSolid(scanLX, scanLY);

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

				rightSolid = map.getSolid(scanRX, scanRY);

				if(rightSolid)
				{
					break;
				}

				rightScan++;
			}
		}

		this.pdL.args.x = scanLX;
		this.pdL.args.y = scanLY;

		this.pdR.args.x = scanRX;
		this.pdR.args.y = scanRY;

		this.angle = Math.atan((rightScan - leftScan) / sensorSpread );

		if(!this.falling)
		{
			let offset = ((leftScan + rightScan) / 2);

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

			if(leftSolid && rightSolid && (leftScan <= 0 && rightScan <= 0))
			{
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

		if(leftScan > 0 && rightScan > 0)
		{
			this.falling = true;
		}
		else
		{
			this.falling = false;
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
		if(this.gSpeed > 0)
		{
			this.gSpeed = 0;
		}

		if(this.gSpeed > -this.gSpeedMax)
		{
			this.gSpeed--;
		}
	}

	goRight()
	{
		if(this.gSpeed < 0)
		{
			this.gSpeed = 0;
		}

		if(this.gSpeed < this.gSpeedMax)
		{
			this.gSpeed++;
		}
	}

	slowDown()
	{
		if(Math.abs(this.gSpeed) > 32)
		{
			this.gSpeed = this.gSpeed * 0.95;
		}
		else
		{
			this.gSpeed = this.gSpeed * 0.75;
		}

		if(Math.abs(this.gSpeed) <= 0.1)
		{
			this.gSpeed = 0;
		}
	}

	jump()
	{
		if(this.falling)
		{
			return;
		}

		this.falling = true;
		this.jumped = true;
		this.mode = this.args.mode = this.modes.floor;

		let angle;

		if(this.mode === this.modes.floor)
		{
			angle = this.angle;
		}
		else if(this.mode === this.modes.leftWall)
		{
			angle = this.angle + 1 * (Math.PI / 2);
		}
		else if(this.mode === this.modes.ceiling)
		{
			angle = this.angle + 2 * (Math.PI / 2);
		}
		else if(this.mode === this.modes.rightWall)
		{
			angle = this.angle + 3 * (Math.PI / 2);
		}

		this.angle = 0;

		this.ySpeed = -Math.cos(angle) * 20;
		this.xSpeed = Math.sin(angle) * 20;

		if(this.mode === this.modes.leftWall || this.mode === this.modes.rightWall)
		{
			this.gSpeed = 0;
		}

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
