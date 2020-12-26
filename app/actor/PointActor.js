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

		this.args.xSpeed = 1;
		this.args.xSpeedRun = 10;
		this.args.ySpeed = 20;

		this.maxStep   = 4;
		this.leftStep  = 0;
		this.rightStep = 0;

		this.args.mode = MODE_FLOOR;
	}

	update()
	{
		this.args.xSpeed = 1;

		if(this.running)
		{
		 	this.args.xSpeed = 10;
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

					return i;
				}
			}
		);

		if(downDistance === false)
		{
			switch(this.args.mode)
			{
				case MODE_FLOOR:
					this.args.y += this.args.ySpeed;
					break;
				case MODE_RIGHT:
					this.args.x += this.args.ySpeed;
					break;
				case MODE_CEILING:
					this.args.y -= this.args.ySpeed;
					break;
				case MODE_LEFT:
					this.args.x -= this.args.ySpeed;
					break;
			}
		}

		switch(this.args.mode)
		{
			case MODE_FLOOR:
			case MODE_LEFT:
				this.leftStep  = this.findStepHeight(-this.args.xSpeed);
				this.rightStep = this.findStepHeight(this.args.xSpeed);
				break;
			case MODE_RIGHT:
			case MODE_CEILING:
				this.leftStep  = this.findStepHeight(this.args.xSpeed);
				this.rightStep = this.findStepHeight(-this.args.xSpeed);
				break;
		}


		console.log(this.leftStep, this.rightStep);

		this.args.angle = Math.atan((this.rightStep - this.leftStep) / (this.args.xSpeed * 2));

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

		for(let i = 0; i <= length; i++)
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

	goLeft()
	{
		let stepOver = 0, stepUp = 0;

		if(this.leftStep)
		{
			if(this.leftStep > this.maxStep * this.args.xSpeed)
			{
				return;
			}

			stepUp = -this.leftStep;
		}

		stepOver = this.args.xSpeed;

		switch(this.args.mode)
		{
			case MODE_FLOOR:
				this.args.x -= stepOver;
				this.args.y += stepUp;
				break;
			case MODE_RIGHT:
				this.args.x += stepUp;
				this.args.y += stepOver;
				break;
			case MODE_CEILING:
				this.args.x += stepOver;
				this.args.y -= stepUp;
				break;
			case MODE_LEFT:
				this.args.x -= stepUp;
				this.args.y -= stepOver;
				break;
		}
	}

	goRight()
	{
		let stepOver = 0, stepUp = 0;

		if(this.rightStep)
		{
			if(this.rightStep > this.maxStep * this.args.xSpeed)
			{
				return;
			}

			stepUp = -this.rightStep;
		}

		stepOver = this.args.xSpeed;

		console.log(stepOver, stepUp);

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
		this.args.y -= this.args.ySpeed+1;
	}

	goDown()
	{
		this.args.y++;
	}

	rad2deg(x)
	{
		return Math.round((180 / Math.PI * x) * 10) / 10;
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

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
}
