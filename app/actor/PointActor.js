import { View } from 'curvature/base/View';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class PointActor extends View
{
	template = `<div
		class = "point-actor"
		style = "--x:[[x]];--y:[[y]];--angle:[[angle]]"

		data-angle = "[[angle|rad2deg]]"
		data-mode  = "[[mode]]"
	></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 256 + 1022;
		this.args.y = this.args.y || 256;

		this.args.maxGSpeed = 10;

		this.args.gSpeed = 0;
		this.args.xSpeed = 0;
		this.args.ySpeed = 5;

		this.args.maxFall = 500;

		this.maxStep   = 4;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.falling = false;

		this.args.mode = MODE_FLOOR;

		this.xAxis = 0;
		this.yAxis = 0;
	}

	update()
	{
		const maxGSpeed = this.args.maxGSpeed;

		if(this.xAxis > 0)
		{
			if(this.args.gSpeed < maxGSpeed)
			{
				this.args.gSpeed++;
			}
		}
		else if(this.xAxis < 0)
		{
			if(this.args.gSpeed > -maxGSpeed)
			{
				this.args.gSpeed--;
			}
		}
		else if(this.args.gSpeed > 0)
		{
			this.args.gSpeed--;
		}
		else if(this.args.gSpeed < 0)
		{
			this.args.gSpeed++;
		}

		this.goHorizontal(this.args.gSpeed, -this.frontStep);

		if(this.args.ySpeed < this.args.maxFall)
		{
			this.args.ySpeed++;
		}

		if(this.running)
		{
		 	this.args.maxGSpeed = 50;
		}
		else
		{
			this.args.maxGSpeed = 10;
		}

		const tileMap = this.viewport.tileMap;

		let offset;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				offset = [0,1];
				break;
			case MODE_RIGHT:
				offset = [1,0];
				break;
			case MODE_CEILING:
				offset = [0,-1];
				break;
			case MODE_LEFT:
				offset = [-1,0];
				break;
		}

		const downDistance = this.castRay(
			this.args.ySpeed
			, this.downAngle
			, offset
			, (i, point) => {
				const tile    = tileMap.coordsToTile(...point);
				const tileNo  = tileMap.getTileNumber(...tile);

				if(!tileNo)
				{
					return;
				}

				if(tileMap.getSolid(tileNo, ...point))
				{
					switch(this.args.mode)
					{
						case MODE_FLOOR:
							this.args.y += i;
							break;
						case MODE_RIGHT:
							this.args.x += i;
							break;
						case MODE_CEILING:
							this.args.y -= i;
							break;
						case MODE_LEFT:
							this.args.x -= i;
							break;
					}

					this.args.x = Math.floor(this.args.x);
					this.args.y = Math.floor(this.args.y);

					return i;
				}
			}
		);

		if(downDistance === false)
		{
			this.args.falling = true;

			switch(this.args.mode)
			{
				case MODE_FLOOR:
					this.args.y += this.args.ySpeed;
					this.args.x += this.args.xSpeed;
					break;
				case MODE_RIGHT:
					this.args.x += this.args.ySpeed;
					this.args.y -= this.args.xSpeed;
					break;
				case MODE_CEILING:
					this.args.y -= this.args.ySpeed;
					this.args.x -= this.args.xSpeed;
					break;
				case MODE_LEFT:
					this.args.x -= this.args.ySpeed;
					this.args.y += this.args.xSpeed;
					break;
			}
		}
		else
		{
			this.args.falling = false;
		}

		let sensorSpread;

		if(this.args.gSpeed > 0)
		{
			sensorSpread = 1 + this.args.gSpeed;
		}
		else if(this.args.gSpeed < 0)
		{
			sensorSpread = -1 + this.args.gSpeed;
		}
		else
		{
			sensorSpread = 2;
		}

		switch(this.args.mode)
		{
			case MODE_FLOOR:
			case MODE_LEFT:
				this.backStep  = this.findStepHeight(-sensorSpread);
				this.frontStep = this.findStepHeight(sensorSpread);
				break;
			case MODE_RIGHT:
			case MODE_CEILING:
				this.backStep  = this.findStepHeight(sensorSpread);
				this.frontStep = this.findStepHeight(-sensorSpread);
				break;
		}

		this.args.angle = Math.atan(((this.frontStep||0) - (this.backStep||0)) / (sensorSpread * 2));

		if(this.backStep > 0 || this.frontStep > 0)
		{
			if(this.args.angle > Math.PI / 4)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:
						this.args.mode = MODE_RIGHT;
						break;
					case MODE_RIGHT:
						this.args.mode = MODE_CEILING;
						break;
					case MODE_CEILING:
						this.args.mode = MODE_LEFT;
						break;
					case MODE_LEFT:
						this.args.mode = MODE_FLOOR;
						break;
				}
			}

			if(this.args.angle < -Math.PI / 4)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:
						this.args.mode = MODE_LEFT;
						break;
					case MODE_RIGHT:
						this.args.mode = MODE_FLOOR;
						break;
					case MODE_CEILING:
						this.args.mode = MODE_RIGHT;
						break;
					case MODE_LEFT:
						this.args.mode = MODE_CEILING;
						break;
				}
			}
		}
	}

	findStepHeight(offset = 0)
	{
		const tileMap = this.viewport.tileMap;
		const maxStepSpeed = this.maxStep * Math.abs(offset);

		let offsetPoint;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				offsetPoint = [offset, -maxStepSpeed];
				break;
			case MODE_RIGHT:
				offsetPoint = [-maxStepSpeed, offset];
				break;
			case MODE_CEILING:
				offsetPoint = [offset, maxStepSpeed];
				break;
			case MODE_LEFT:
				offsetPoint = [maxStepSpeed, offset];
				break;
		}

		return this.castRay(
			maxStepSpeed * 2
			, this.downAngle
			, offsetPoint
			, (i, point) => {
				const tile    = tileMap.coordsToTile(...point);
				const tileNo  = tileMap.getTileNumber(...tile);

				// console.log(point);

				if(!tileNo)
				{
					return;
				}

				if(tileMap.getSolid(tileNo, ...point))
				{
					return 1 + maxStepSpeed - i;
				}
			}
		);
	}

	castRay(...args)
	{
		let length   = 1;
		let callback = () => {};
		let angle    = Math.PI / 2;
		let offset   = [0,0];

		switch(args.length)
		{
			case 2:
				[length, callback] = args;
				break;
			case 3:
				[length, angle, callback] = args;
				break;
			case 4:
				[length, angle, offset, callback] = args;
				break;
		}

		let hit = false;

		for(let i = 0; i < Math.floor(length); i++)
		{
			const bottom  = [
				this.x + offset[0] + (i * Math.cos(angle))
				, this.y + offset[1] + (i * Math.sin(angle))
			];

			const retVal = callback(i, bottom);

			if(retVal !== undefined)
			{
				return retVal;
			}
		}

		return false;
	}

	jump()
	{
		if(!this.args.falling)
		{
			this.args.xSpeed =  15 * Math.cos(this.args.angle + Math.PI/2);
			this.args.ySpeed = -15 * Math.sin(this.args.angle + Math.PI/2);
		}

		this.args.falling = true;
	}

	goRight()
	{
		if(this.args.gSpeed >= this.args.maxGSpeed)
		{
			return;
		}

		this.args.gSpeed++;
	}

	goLeft()
	{
		if(this.args.gSpeed <= -this.args.maxGSpeed)
		{
			return;
		}

		this.args.gSpeed--;
	}

	goHorizontal(stepOver = 0, stepUp = 0)
	{
		if(stepUp)
		{
			if(Math.abs(stepUp) > Math.abs(this.maxStep * this.args.gSpeed))
			{
				return;
			}
		}

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				this.args.x += stepOver;
				this.args.y += stepUp;
				break;
			case MODE_RIGHT:
				this.args.x += stepUp;
				this.args.y -= stepOver;
				break;
			case MODE_CEILING:
				this.args.x -= stepOver;
				this.args.y -= stepUp;
				break;
			case MODE_LEFT:
				this.args.x -= stepUp;
				this.args.y += stepOver;
				break;
		}
	}

	goUp()
	{
		this.args.ySpeed = -2;
	}

	goDown()
	{
		this.args.y++;
	}

	rad2deg(rad)
	{
		const deg = (180 / Math.PI * rad);

		if(deg > 0)
		{
			return Math.floor(deg * 10) / 10;
		}

		return Math.ceil(deg * 10) / 10;
	}

	get downAngle()
	{
		// return Math.PI/2;
		switch(this.args.mode)
		{
			case MODE_FLOOR:
				return Math.PI/2;
				break;
			case MODE_RIGHT:
				return 0;
				break;
			case MODE_CEILING:
				return -Math.PI/2;
				break;
			case MODE_LEFT:
				return Math.PI;
				break;
		}
	}

	get upAngle()
	{
		// return Math.PI/2;
		switch(this.args.mode)
		{
			case MODE_FLOOR:
				return -Math.PI/2;
				break;
			case MODE_RIGHT:
				return Math.PI;
				break;
			case MODE_CEILING:
				return Math.PI/2;
				break;
			case MODE_LEFT:
				return 0;
				break;
		}
	}

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
}
