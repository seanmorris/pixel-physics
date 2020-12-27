import { View } from 'curvature/base/View';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

const JUMP_FORCE     = 25;
const RUNNING_SPEED  = 30;
const WALKING_SPEED  = 12;
const CRAWLING_SPEED = 3;

export class PointActor extends View
{
	template = `<div
		class = "point-actor"
		style = "--x:[[x]];--y:[[y]];--angle:[[angle]];--flyAngle:[[flyAngle]];"
		data-facing = "[[facing]]"
		data-angle  = "[[angle|rad2deg]]"
		data-mode   = "[[mode]]"
	></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 256 + 1024;
		this.args.y = this.args.y || 128;

		this.args.maxGSpeed = WALKING_SPEED;

		this.args.gSpeed = 0;
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.args.maxFall = 50;

		this.maxStep   = 4;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.falling  = false;
		this.args.running  = false;
		this.args.crawling = false;

		this.args.mode = MODE_FLOOR;

		this.xAxis = 0;
		this.yAxis = 0;
	}

	update()
	{
		const tileMap = this.viewport.tileMap;

		while(true)
		{
			const currentTile   = tileMap.coordsToTile(this.x, this.y);
			const currentTileNo = tileMap.getTileNumber(...currentTile);

			if(!tileMap.getSolid(currentTileNo, this.x, this.y))
			{
				break;
			}


			switch(this.args.mode)
			{
				case MODE_FLOOR:
					this.args.y--;
					break;

				case MODE_RIGHT:
					this.args.x--;
					break;

				case MODE_CEILING:
					this.args.y++;
					break;

				case MODE_LEFT:
					this.args.x++;
					break;
			}

		}

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

				const tile   = tileMap.coordsToTile(...point);
				const tileNo = tileMap.getTileNumber(...tile);

				if(!tileNo)
				{
					return;
				}

				if(tileMap.getSolid(tileNo, ...point))
				{
					this.args.x = Math.floor(this.args.x);
					this.args.y = Math.floor(this.args.y);

					return i;
				}
			}
		);

		this.args.flyAngle = this.args.xSpeed < 0
			? this.leftAngle
			: this.rightAngle;

		const airDistance = this.castRay(
			Math.abs(this.args.xSpeed) + 1
			, this.args.xSpeed < 0
				? this.leftAngle
				: this.rightAngle
			, [this.args.xSpeed < 0 ? -1 : 1, 0]
			, (i, point) => {

				const tile    = tileMap.coordsToTile(...point);
				const tileNo  = tileMap.getTileNumber(...tile);

				if(!tileNo)
				{
					return;
				}

				if(tileMap.getSolid(tileNo, ...point))
				{
					return i;
				}
			}
		);

		const upDistance = this.castRay(
			Math.abs(this.args.ySpeed) + 1
			, this.upAngle
			, (i, point) => {

				const tile    = tileMap.coordsToTile(...point);
				const tileNo  = tileMap.getTileNumber(...tile);

				if(!tileNo)
				{
					return;
				}

				if(tileMap.getSolid(tileNo, ...point))
				{
					return i;
				}
			}
		);

		if(upDistance !== false)
		{
			this.args.ySpeed = upDistance;
		}

		if(airDistance !== false)
		{
			if(this.args.xSpeed > 0)
			{
				this.args.xSpeed = airDistance;
			}
			else
			{
				this.args.xSpeed = -airDistance;
			}
		}

		if(downDistance === false)
		{
			this.args.y += this.args.ySpeed;
			this.args.x += this.args.xSpeed;

			this.args.falling = true;
		}
		else if(downDistance)
		{
			this.args.falling = false;

			switch(this.args.mode)
			{
				case MODE_FLOOR:
					this.args.y += downDistance;
					break;

				case MODE_RIGHT:
					this.args.x += downDistance;
					break;

				case MODE_CEILING:
					this.args.y -= downDistance;
					break;

				case MODE_LEFT:
					this.args.x -= downDistance;
					break;
			}
		}
		else
		{
			this.args.falling = false;
		}

		if(this.running)
		{
			this.args.maxGSpeed = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			this.args.maxGSpeed = CRAWLING_SPEED;
		}
		else
		{
			this.args.maxGSpeed = WALKING_SPEED;
		}

		if(!this.args.falling)
		{
			if(this.xAxis)
			{
				if(this.args.gSpeed < this.args.maxGSpeed && this.args.gSpeed > -this.args.maxGSpeed)
				{
					this.args.gSpeed += this.xAxis;
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
		}
		else if(this.xAxis)
		{
			this.args.xSpeed += this.xAxis * 0.3;
		}

		if(this.xAxis < 0)
		{
			this.args.facing = 'left';
		}

		if(this.xAxis > 0)
		{
			this.args.facing = 'right';
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
			sensorSpread = 1;
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

		this.args.angle = Math.atan(
			((this.frontStep||0) - (this.backStep||0))
			/ (sensorSpread * 2)
		);

		if(this.args.gSpeed < -this.args.maxGSpeed)
		{
			this.args.gSpeed = -this.args.maxGSpeed;
		}
		else if(this.args.gSpeed > this.args.maxGSpeed)
		{
			this.args.gSpeed = this.args.maxGSpeed;
		}

		if(Math.abs(this.frontStep) < Math.abs(this.maxStep * this.args.gSpeed))
		{
			switch(this.args.mode)
			{
				case MODE_FLOOR:
					this.args.x += this.args.gSpeed;
					this.args.y -= this.frontStep;
					break;
				case MODE_RIGHT:
					this.args.x -= this.frontStep;
					this.args.y -= this.args.gSpeed;
					break;
				case MODE_CEILING:
					this.args.x -= this.args.gSpeed;
					this.args.y += this.frontStep;
					break;
				case MODE_LEFT:
					this.args.x += this.frontStep;
					this.args.y += this.args.gSpeed;
					break;
			}
		}

		if(this.args.ySpeed < this.args.maxFall)
		{
			this.args.ySpeed++;
		}

		if(this.args.ySpeed > this.args.maxFall)
		{
			this.args.ySpeed = this.args.maxFall;
		}

		if(!this.args.falling)
		{
			if(this.args.angle > Math.PI / 4 || (this.frontStep === false && this.args.angle > 0))
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
			else if(this.args.angle < -Math.PI / 4 || (this.frontStep === false && this.args.angle < 0))
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

			if(this.args.gSpeed === 0)
			{
				this.args.mode   = MODE_FLOOR;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
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
			maxStepSpeed*2
			, this.downAngle
			, offsetPoint
			, (i, point) => {
				const tile    = tileMap.coordsToTile(...point);
				const tileNo  = tileMap.getTileNumber(...tile);

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
		if(this.args.falling)
		{
			return;
		}

		const originalMode = this.args.mode;

		this.args.mode = MODE_FLOOR;

		switch(originalMode)
		{
			case MODE_FLOOR:

				this.args.xSpeed = this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);
				this.args.ySpeed = this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);

				this.args.xSpeed +=  JUMP_FORCE * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed += -JUMP_FORCE * Math.sin(this.args.angle + Math.PI/2);

				break;

			case MODE_LEFT:

				this.args.xSpeed = -this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed =  this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);

				this.args.xSpeed -= JUMP_FORCE * Math.sin(this.args.angle - Math.PI/2);
				this.args.ySpeed -= JUMP_FORCE * Math.cos(this.args.angle - Math.PI/2);

				break;

			case MODE_CEILING:

				this.args.xSpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);
				this.args.ySpeed =  this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);

				this.args.xSpeed -= JUMP_FORCE * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed += JUMP_FORCE * Math.sin(this.args.angle + Math.PI/2);

				break;

			case MODE_RIGHT:

				this.args.xSpeed =  this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);

				this.args.xSpeed += JUMP_FORCE * Math.sin(this.args.angle - Math.PI/2);
				this.args.ySpeed += JUMP_FORCE * Math.cos(this.args.angle - Math.PI/2);

				break;
		}

		if(this.args.xSpeed > 30)
		{
			this.args.xSpeed = 30;
		}

		if(this.args.xSpeed < -30)
		{
			this.args.xSpeed = -30;
		}

		if(this.args.ySpeed > 30)
		{
			this.args.ySpeed = 30;
		}

		if(this.args.ySpeed < -30)
		{
			this.args.ySpeed = -30;
		}

		this.args.falling = true;
		this.args.gSpeed  = 0;
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

	get leftAngle()
	{
		switch(this.args.mode)
		{
			case MODE_FLOOR:
				return Math.PI;
				break;

			case MODE_RIGHT:
				return -Math.PI/2;
				break;

			case MODE_CEILING:
				return 0;
				break;

			case MODE_LEFT:
				return Math.PI/2;
				break;
		}
	}

	get rightAngle()
	{
		switch(this.args.mode)
		{
			case MODE_FLOOR:
				return 0;
				break;

			case MODE_RIGHT:
				return Math.PI/2;
				break;

			case MODE_CEILING:
				return Math.PI;
				break;

			case MODE_LEFT:
				return -Math.PI/2;
				break;
		}
	}

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
}
