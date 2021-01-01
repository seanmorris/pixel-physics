import { View } from 'curvature/base/View';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

const WALKING_SPEED  = 15;
const RUNNING_SPEED  = 2 * WALKING_SPEED;
const CRAWLING_SPEED = 1;

const JUMP_FORCE     = 16;

const DEFAULT_GRAVITY = MODE_FLOOR;

export class PointActor extends View
{
	template = `<div
		class = "point-actor [[type]] [[collType]]"
		style = "
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--debugVector:[[debugVector]];
			--height:[[height]];
			--width:[[width]];
			--x:[[x]];
			--y:[[y]];
		"
		data-colliding = "[[colliding]]"
		data-falling   = "[[falling]]"
		data-facing    = "[[facing]]"
		data-angle     = "[[angle|rad2deg]]"
		data-mode      = "[[mode]]"
	></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-generic'

		this.args.x = this.args.x || 1024 + 256;
		this.args.y = this.args.y || 120;

		this.args.width  = 1;
		this.args.height = 1;

		this.args.maxGSpeed = WALKING_SPEED;

		this.args.gSpeed = 0;
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;

		this.args.maxFall   = 32;

		this.args.xSpeedMax = 30;
		this.args.ySpeedMax = 30;

		this.maxStep   = 3;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.falling  = false;
		this.args.running  = false;
		this.args.crawling = false;

		this.args.mode = DEFAULT_GRAVITY;

		this.xAxis = 0;
		this.yAxis = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.args.ignore = 0;
		this.args.float  = 0;

		this.colliding = false;

		this.args.bindTo(['xSpeed'], v => {
			this.args.airAngle = Math.atan2(this.args.ySpeed, v);
		})

		this.args.bindTo(['ySpeed'], v => {
			this.args.airAngle = Math.atan2(v, this.args.xSpeed);
		})
	}

	updateStart()
	{
		this.colliding = false;
	}

	update()
	{
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

		if(this.args.ignore < 1)
		{
			this.args.ignore = 0;
		}

		const tileMap = this.viewport.tileMap;

		if(this.args.falling)
		{
			this.args.landed = false;
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
			this.args.ySpeed + 1
			, this.downAngle
			, offset
			, (i, point) => {

				const actors = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

				if(actors.length > 0)
				{
					actors.map(a => { this.collideWith(a); a.collideWith(this); });

					return i;
				}

				const tile   = tileMap.coordsToTile(...point);
				const tileNo = tileMap.getTileNumber(...tile);

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

		const airDistance = this.castRay(
			Math.abs(this.args.xSpeed) + 1
			, this.args.xSpeed < 0
				? this.leftAngle
				: this.rightAngle
			, (i, point) => {

				const actors = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

				if(actors.length > 0)
				{
					actors.map(a => { this.collideWith(a); a.collideWith(this); });

					return i;
				}

				const tile   = tileMap.coordsToTile(...point);
				const tileNo = tileMap.getTileNumber(...tile);

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
				const actors = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

				if(actors.length > 0 && i === 0)
				{
					actors.map(a => { this.collideWith(a); a.collideWith(this); });

					return i;
				}

				const tile   = tileMap.coordsToTile(...point);
				const tileNo = tileMap.getTileNumber(...tile);

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

		if(this.args.falling)
		{
			this.willJump = false;

			let blockers = false;

			if(this.args.ySpeed < 0 && (blockers = this.getMapSolidAt(this.x, this.y-upDistance)))
			{
				this.args.float = 2;
				this.ignore = 7;

				this.args.y -= Math.floor(upDistance - 1);

				this.args.xSpeed = 0;
				this.args.ySpeed = 0;

				if(this.willStick)
				{
					this.args.mode = MODE_CEILING;

					console.log(this.args.mode);
				}

			}
			else if(this.args.ySpeed > 0
				&& (blockers = this.getMapSolidAt(this.x, this.y+1))
			){
				this.args.x += downDistance;
				this.ignore = 7;

				this.args.mode = DEFAULT_GRAVITY;
			}
			else if(this.args.xSpeed > 0
				&& (blockers = this.getMapSolidAt(this.x+this.args.xSpeed, this.y+this.args.ySpeed))
			){
				this.args.x += airDistance;
				this.ignore = 7;

				if(this.willStick && airDistance)
				{
					this.args.mode = MODE_RIGHT;
					this.args.falling = false;
				}

			}
			else if(this.args.xSpeed < 0
				&& (blockers = this.getMapSolidAt(this.x+this.args.xSpeed, this.y+this.args.ySpeed)))
			{
				this.args.x -= airDistance;
				this.ignore = 7;

				if(this.willStick && airDistance)
				{
					this.args.mode = MODE_LEFT;
					this.args.falling = false;

					console.log(this.args.mode);
				}
			}

			if(Array.isArray(blockers))
			{
				blockers.map(a => { this.collideWith(a); a.collideWith(this); });
			}
		}

		if(this.args.xSpeed < -this.args.xSpeedMax)
		{
			this.args.xSpeed = -this.args.xSpeedMax;
		}
		else if(this.args.xSpeed > this.args.xSpeedMax)
		{
			this.args.xSpeed = this.args.xSpeedMax;
		}

		if(this.args.ySpeed < -this.args.ySpeedMax)
		{
			this.args.ySpeed = -this.args.ySpeedMax;
		}
		else if(this.args.ySpeed > this.args.ySpeedMax)
		{
			this.args.ySpeed = this.args.ySpeedMax;
		}

		if(downDistance === false)
		{
			this.args.x += this.args.xSpeed;
			this.args.y += this.args.ySpeed;

			this.args.falling = true;
		}
		else if(downDistance > 0)
		{
			this.args.falling = false;
			this.willJump     = false;
			this.args.xSpeed  = 0;
			this.args.ySpeed  = 0;

			if(this.args.falling)
			{
				this.args.ignore  = 1;
			}

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
			if(this.willJump)
			{
				this.doJump();
			}

			if(this.args.falling)
			{
				this.args.ignore = 1;
			}

			this.args.falling = false;
		}

		let nextPosition = [0, 0];

		if(!this.args.falling)
		{

			nextPosition = this.findNextStep(this.args.gSpeed || 2);

			if(nextPosition[1] !== false)
			{
				this.args.angle = nextPosition[0]
					? Math.atan(nextPosition[1] / nextPosition[0])
					: nextPosition[1] > 0 ? Math.PI / 2 : -Math.PI / 2;
			}
			else if(this.args.gSpeed && nextPosition[2] === true)
			{
				nextPosition[0] = this.args.gSpeed;
				nextPosition[1] = 0;

				this.args.falling = true;
				this.args.ySpeed  = 0;

				switch(this.args.mode)
				{
					case MODE_FLOOR:
						this.args.xSpeed = this.args.gSpeed;
						break;

					case MODE_RIGHT:
						this.args.ySpeed = this.args.gSpeed;
						break;

					case MODE_CEILING:
						this.args.xSpeed = -this.args.gSpeed;
						break;

					case MODE_LEFT:
						this.args.ySpeed = -this.args.gSpeed;
						break;
				}
			}

			if(this.args.gSpeed)
			{
				switch(this.args.mode)
				{
					case MODE_FLOOR:
						this.args.x += nextPosition[0];
						this.args.y -= nextPosition[1];
						break;

					case MODE_CEILING:
						this.args.x -= nextPosition[0];
						this.args.y += nextPosition[1];
						break;

					case MODE_LEFT:
						this.args.x += nextPosition[1];
						this.args.y += nextPosition[0];
						break;

					case MODE_RIGHT:
						this.args.x -= nextPosition[1];
						this.args.y -= nextPosition[0];
						break;
				}
			}

			this.args.x = Math.floor(this.args.x);
			this.args.y = Math.floor(this.args.y);
		}


		if(!this.args.falling)
		{
			if(this.args.angle > Math.PI / 4 && this.args.angle < Math.PI / 2)
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

				this.args.angle -= Math.PI / 8*3;
			}
			else if(this.args.angle < -Math.PI / 4 && this.args.angle > -Math.PI / 2)
			{
				const orig = this.args.mode;

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

				this.args.angle += Math.PI / 8*3;
			}

			if(this.args.gSpeed === 0)
			{
				// this.args.xSpeed = 0;
				// this.args.ySpeed = 0;

				if(!this.stayStuck)
				{
					const currentTile   = tileMap.coordsToTile(this.x, this.y+1);
					const currentTileNo = tileMap.getTileNumber(...currentTile);

					if(!tileMap.getSolid(currentTileNo, this.x, this.y+1))
					{
						this.args.mode = DEFAULT_GRAVITY;
					}
				}
			}

			this.args.landed = true;
		}

		if(this.args.ignore < 1)
		{
			this.args.ignore = 0;
		}

		if(!this.args.float && this.args.ySpeed < this.args.maxFall)
		{
			this.args.ySpeed++;
		}

		if(this.args.ySpeed > this.args.maxFall)
		{
			this.args.ySpeed = this.args.maxFall;
		}

		if(nextPosition[0] !== false || nextPosition[1] !== false)
		{
			if(this.args.gSpeed < -this.args.maxGSpeed)
			{
				this.args.gSpeed = -this.args.maxGSpeed;
			}
			else if(this.args.gSpeed > this.args.maxGSpeed)
			{
				this.args.gSpeed = this.args.maxGSpeed;
			}
		}
		else
		{
			this.args.ignore = this.args.ignore || 1;

			this.args.gSpeed = 0;
		}

		if(this.args.ignore === 0)
		{
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
				this.args.xSpeed += this.xAxis * 0.8;
			}
		}

		if(this.args.ignore > 0)
		{
			this.args.ignore--;
		}

		if(this.args.float > 0)
		{
			this.args.float--;
		}

		let backAngle = this.args.airAngle;

		if(this.args.airAngle > 0)
		{
			backAngle -= Math.PI;
		}
		else
		{
			backAngle += Math.PI;
		}

		let testX = this.x;
		let testY = this.y;

		if(this.getMapSolidAt(testX, testY))
		{
			this.args.ignore = 5;

			let b, blockers

			while(b = this.getMapSolidAt(testX, testY))
			{
				blockers = b;
				testX += Math.cos(backAngle);
				testY += Math.sin(backAngle);
			}

			if(Array.isArray(blockers))
			{
				blockers.map(a => { this.collideWith(a); a.collideWith(this); });
			}

			this.args.x = testX;
			this.args.y = testY;

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			this.args.falling = false;
			this.willJump = false;
		}

		this.args.debugVector = this.args.angle;

		if(this.args.falling)
		{
			this.args.debugVector = this.args.airAngle;
			this.args.landed = false;
		}

		if(this.xAxis < 0)
		{
			this.args.facing = 'left';
		}

		if(this.xAxis > 0)
		{
			this.args.facing = 'right';
		}

		this.args.colliding = this.colliding;
	}

	collideWith(other)
	{
		if(other.y < this.y && other.x >= this.x - (this.args.width/2))
		{
			this.args.collType = 'collision-top';
		}
		else if(other.y > this.y + this.args.height)
		{
			this.args.collType = 'collision-bottom';
		}
		else if(other.x < this.x)
		{
			this.args.collType = 'collision-left';
		}
		else if(other.x >= this.x + (this.args.width/2))
		{
			this.args.collType = 'collision-right';
		}


		this.colliding = true;
	}

	findNextStep(offset)
	{
		const sign = offset < 0? -1: 1;

		let downFirstSolid;
		let upFirstSpace;
		let col = 0;

		const tileMap = this.viewport.tileMap;

		const retVal = false;

		let currentLevel = 0;
		let prevUp = 0;
		let isCliff = false;

		for(; col < Math.abs(offset); col++)
		{
			downFirstSolid = false;
			upFirstSpace = false;

			let offsetPoint;

			switch(this.args.mode)
			{
				case MODE_FLOOR:
					offsetPoint = [(1 + col) * sign, 1]
					break;

				case MODE_RIGHT:
					offsetPoint = [1, -(1 + col) * sign]
					break;

				case MODE_CEILING:
					offsetPoint = [-(1 + col) * sign, -1]
					break;

				case MODE_LEFT:
					offsetPoint = [-1, (1 + col) * sign]
					break;
			}

			downFirstSolid = this.castRay(
				this.maxStep * (1+col)
				, this.downAngle
				, offsetPoint
				, (i, point) => {
					const actors = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

					actors.map(a => { this.collideWith(a); a.collideWith(this); });

					if(actors.length > 0)
					{
						return i;
					}

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

			if(downFirstSolid === false)
			{
				return [col * sign, false, true];
			}
			else
			{
				currentLevel += downFirstSolid;
			}

			if(downFirstSolid === 0)
			{
				let offsetPoint;

				switch(this.args.mode)
				{
					case MODE_FLOOR:
						offsetPoint = [(1 + col) * sign, 0]
						break;

					case MODE_RIGHT:
						offsetPoint = [0, -(1 + col) * sign]
						break;

					case MODE_CEILING:
						offsetPoint = [-(1 + col) * sign, 0]
						break;

					case MODE_LEFT:
						offsetPoint = [0, (1 + col) * sign]
						break;
				}

				const upLength = this.maxStep * (1 + col);

				upFirstSpace = this.castRay(
					upLength
					, this.upAngle
					, offsetPoint
					, (i, point) => {
						const actors = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

						actors.map(a => { this.collideWith(a); a.collideWith(this); });

						if(actors.length === 0)
						{
							const tile    = tileMap.coordsToTile(...point);
							const tileNo  = tileMap.getTileNumber(...tile);

							if(!tileNo)
							{
								return i;
							}

							if(!tileMap.getSolid(tileNo, ...point))
							{
								return i;
							}
						}

					}
				);

				if(upFirstSpace === false || Math.abs(prevUp - upFirstSpace) > this.maxStep)
				{
					return [col * sign, false, false, currentLevel];
				}
				else
				{
					currentLevel -= upFirstSpace;

					prevUp = upFirstSpace;
				}
			}
		}

		if(upFirstSpace !== false)
		{
			return [col * sign, upFirstSpace, false, currentLevel];
		}

		return [col * sign, -downFirstSolid, false,  currentLevel];
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
		if(this.args.falling || this.willJump)
		{
			return;
		}

		if(!this.willJump)
		{
			this.willJump = true;
		}
	}

	doJump()
	{
		if(
			this.args.ignore
			|| this.args.falling
			|| !this.args.landed
			|| this.args.float
		){
			return;
		}

		let force = JUMP_FORCE;

		if(this.running)
		{
			force = JUMP_FORCE * 1.5;
		}
		else if(this.crawling)
		{
			force = JUMP_FORCE * 0.75;
		}

		const originalMode = this.args.mode;

		this.args.ignore  = 500;
		this.args.landed  = false;
		this.args.falling = true;
		this.args.gSpeed  = 0;

		switch(originalMode)
		{
			case MODE_FLOOR:

				this.args.xSpeed = this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);
				this.args.ySpeed = this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);

				this.args.xSpeed += force * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed -= force * Math.sin(this.args.angle + Math.PI/2);

				break;

			case MODE_LEFT:

				this.args.xSpeed = -this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed =  this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);

				this.args.xSpeed -= force * Math.sin(this.args.angle - Math.PI/2);
				this.args.ySpeed -= force * Math.cos(this.args.angle - Math.PI/2);

				break;

			case MODE_CEILING:

				this.args.xSpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);
				this.args.ySpeed = -this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);

				this.args.xSpeed -= force * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed += force * Math.sin(this.args.angle + Math.PI/2);

				break;

			case MODE_RIGHT:

				this.args.xSpeed =  this.args.gSpeed * Math.cos(this.args.angle + Math.PI/2);
				this.args.ySpeed = -this.args.gSpeed * Math.sin(this.args.angle + Math.PI/2);

				this.args.xSpeed += force * Math.sin(this.args.angle - Math.PI/2);
				this.args.ySpeed += force * Math.cos(this.args.angle - Math.PI/2);

				break;
		}

		if(Math.abs(this.args.xSpeed) < 0.001)
		{
			this.args.xSpeed = 0;
		}

		if(Math.abs(this.args.ySpeed) < 0.001)
		{
			this.args.ySpeed = 0;
		}

		this.args.mode  = DEFAULT_GRAVITY;
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

	roundAngle(angle, segments)
	{
		segments /= 2;

		var rAngle = Math.round(
			angle / (Math.PI/segments)
		) * Math.PI/segments;

		return rAngle;
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

	getMapSolidAt(...point)
	{
		const tileMap = this.viewport.tileMap;
		const actors  = this.viewport.actorsAtPoint(...point).filter(x=>x!==this);

		if(actors.length > 0)
		{
			return actors;
		}

		const tile   = tileMap.coordsToTile(...point);
		const tileNo = tileMap.getTileNumber(...tile);

		if(!tileNo)
		{
			return false;
		}

		return tileMap.getSolid(tileNo, ...point);
	}

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
}
