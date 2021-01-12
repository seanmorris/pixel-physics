import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

const WALKING_SPEED  = 100;
const RUNNING_SPEED  = Infinity;
const CRAWLING_SPEED = 1;

const JUMP_FORCE     = 15;

const DEFAULT_GRAVITY = MODE_FLOOR;

export class PointActor extends View
{
	template = `<div
		class  = "point-actor [[type]] [[collType]]"
		style  = "
			display:[[display]];
			--angle:[[angle]];
			--airAngle:[[airAngle]];
			--ground-angle:[[groundAngle]];
			--air-angle:[[airAngle]];
			--height:[[height]];
			--width:[[width]];
			--x:[[x]];
			--y:[[y]];
		"
		data-camera-mode = "[[cameraMode]]"
		data-colliding = "[[colliding]]"
		data-falling   = "[[falling]]"
		data-facing    = "[[facing]]"
		data-angle     = "[[angle|rad2deg]]"
		data-mode      = "[[mode]]"
		data-layer     = "[[layer]]"
	><div class = "sprite"></div></div>`;

	static fromDef(objDef)
	{
		const instance = new this();

		const objArgs = {
			x:         objDef.x + 16
			, y:       objDef.y - 1
			, visible: objDef.visible
			, name:    objDef.name
		};

		for(const i in objDef.properties)
		{
			const property = objDef.properties[i];

			objArgs[ property.name ] = property.value;
		}

		return new this(Object.assign({}, objArgs));
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-generic'

		this.args.display = this.args.display || 'initial';

		this.args.emeralds = 0;
		this.args.rings = 0;
		this.args.coins = 0;

		this.args.yMargin = 0;

		this.args.cameraMode = 'normal';

		this.args.layer = 1;

		this.args.x = this.args.x || 1024 + 256;
		this.args.y = this.args.y || 32;

		this.args.width  = this.args.width  || 1;
		this.args.height = this.args.height || 1;

		this.args.direction = this.args.direction || 1;

		this.args.gSpeed = this.args.gSpeed || 0;
		this.args.xSpeed = this.args.xSpeed || 0;
		this.args.ySpeed = this.args.ySpeed || 0;
		this.args.angle  = this.args.angle  || 0;

		this.args.groundAngle = 0;
		this.args.airAngle    = 0;

		this.lastAngles = [0,0];
		this.angleAvg   = 32;

		this.args.xSpeedMax = 512;
		this.args.ySpeedMax = 512;

		this.maxStep   = 4;
		this.backStep  = 0;
		this.frontStep = 0;

		this.args.falling  = true;
		this.args.running  = false;
		this.args.crawling = false;

		this.args.rotateFixed = false;

		this.args.mode = DEFAULT_GRAVITY;

		this.xAxis = 0;
		this.yAxis = 0;

		this.willStick = false;
		this.stayStuck = false;

		this.args.ignore = this.args.ignore || 0;
		this.args.float  = this.args.float  || 0;

		this.colliding = false;

		this.args.bindTo(['xSpeed'], v => {
			this.args.airAngle = Math.atan2(this.args.ySpeed, v);
		});

		this.args.bindTo(['ySpeed'], v => {
			this.args.airAngle = Math.atan2(v, this.args.xSpeed);
		});

		this.impulseMag = null;
		this.impulseDir = null;

		this.args.gSpeedMax = WALKING_SPEED;

		this.args.jumpForce = 14;
		this.args.stopped   = 0;
		this.args.gravity   = 0.65;

		this.args.decel     = 0.85;
		this.args.accel     = 0.3;

		this.controllable = false;

		const bindable = Bindable.make(this);

		bindable.debindGround = null;

		bindable.bindTo('standingOn', (groundObject,key,target) => {

			const prevGroundObject = target[key];

			bindable.debindGroundX && bindable.debindGroundX();
			bindable.debindGroundY && bindable.debindGroundY();
			bindable.debindGroundL && bindable.debindGroundL();

			if(!groundObject)
			{
				if(prevGroundObject)
				{
					if(prevGroundObject.occupant === this)
					{
						prevGroundObject.occupant = null;
					}

					prevGroundObject.xAxis = 0;
					prevGroundObject.yAxis = 0;
				}

				return;
			}

			bindable.debindGroundX = groundObject.args.bindTo('x', (vv,kk) => {
				this.args.x += vv - groundObject.args.x
			});

			bindable.debindGroundY = groundObject.args.bindTo('y', (vv,kk) => {
				this.args.y = vv - groundObject.args.height
			});

			bindable.debindGroundL = groundObject.args.bindTo('layer', (vv,kk) => {
				this.args.layer = vv;
			});

			if(groundObject.isVehicle)
			{
				const occupant = groundObject.occupant;

				groundObject.occupant = this;

				groundObject.args.yMargin = this.args.height;

				if(occupant)
				{
					occupant.standingOn = null;

					occupant.args.gSpeed = 0;
					occupant.args.xSpeed = 8 * this.args.direction
					occupant.args.ySpeed = -8;
					occupant.args.falling = true;
				}

				this.args.gSpeed = 0;
				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
			}

			if(prevGroundObject && prevGroundObject.isVehicle)
			{
				if(prevGroundObject.occupant === this)
				{
					prevGroundObject.occupant = null;
				}

				prevGroundObject.xAxis = 0;
				prevGroundObject.yAxis = 0;
			}
		});

		return bindable;
	}

	onRendered()
	{
		this.listen('click', ()=>{

			if(!this.controllable)
			{
				return;
			}

			this.viewport.nextControl = Bindable.make(this);

			for(const option of this.viewport.tags.currentActor.options)
			{
				if(option.value === this.args.name)
				{
					this.viewport.tags.currentActor.value = option.value;
				}
			}

			this.args.ySpeed = 0;
		});
	}

	updateStart()
	{
		this.colliding = false;
		this.restingOn = null;
	}

	updateEnd()
	{}

	update()
	{
		if(!this.viewport || this.removed)
		{
			return;
		}

		let gSpeedMax = this.args.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		if(this.impulseMag !== null)
		{
			this.args.xSpeed  = Math.cos(this.impulseDir) * this.impulseMag;
			this.args.ySpeed  = Math.sin(this.impulseDir) * this.impulseMag;

			this.args.falling = true;

			this.impulseMag   = null;
			this.impulseDir   = null;
			this.impulseFal   = null;
		}

		if(this.args.ignore < 1)
		{
			this.args.ignore = 0;
		}

		if(this.args.ignore > 0)
		{
			this.args.ignore--;
		}

		if(this.args.float > 0)
		{
			this.args.float--;
		}

		if(this.args.falling)
		{
			this.args.landed = false;
			this.lastAngles  = [];
		}

		if(!this.isEffect && this.args.falling && this.viewport)
		{
			this.updateAirPosition();
		}

		if(!this.isEffect && !this.args.falling)
		{
			this.updateGroundPosition();
		}

		if(!this.viewport || this.removed)
		{
			return;
		}

		const tileMap = this.viewport.tileMap;

		if(this.args.gSpeed === 0)
		{
			if(!this.stayStuck)
			{
				const half = Math.floor(this.args.width / 2) || 0;

				if(!tileMap.getSolid(this.x, this.y+1, this.args.layer))
				{
					this.args.mode = DEFAULT_GRAVITY;
					this.lastAngles = [];
				}
			}
		}

		this.args.landed = true;

		this.args.x = Math.floor(this.args.x);
		this.args.y = Math.floor(this.args.y);

		if(!this.isEffect)
		{
			this.resolveIntersection();
		}

		if(this.args.falling && this.args.ySpeed < this.args.ySpeedMax)
		{
			if(!this.args.float)
			{
				this.args.ySpeed += this.args.gravity;
			}

			this.args.airAngle = this.args.airAngle;
			this.args.landed = false;
		}

		this.processInput();

		if(this.getMapSolidAt(this.x, this.y + 240))
		{
			this.args.cameraMode = 'normal';
		}
		else
		{
			this.args.cameraMode = 'aerial';
		}

		if(this.args.falling || this.args.gSpeed)
		{
			this.args.stopped = 0;
		}
		else
		{
			this.args.stopped++;
		}

		if(!this.args.falling)
		{
			if(this.lastAngles.length)
			{
				this.args.groundAngle = this.lastAngles.reduce(((a,b)=>a+b)) / this.lastAngles.length;
			}

			const standingOn = this.getMapSolidAt(...this.groundPoint);

			const half = Math.floor(this.args.width / 2);

			if(Array.isArray(standingOn) && standingOn.length)
			{
				const groundActors = standingOn.filter(
					a => a.args !== this.args && a.solid
				);

				this.standingOn = groundActors[0];

			}
			else if(!standingOn)
			{
				if(half)
				{
					const leftGroundPoint  = [...this.groundPoint];

					leftGroundPoint[0] -= half;

					const standingOnLeft = this.getMapSolidAt(...leftGroundPoint);

					if(Array.isArray(standingOnLeft) && standingOnLeft.length)
					{
						const groundActors = standingOnLeft.filter(
							a => a.args !== this.args && a.solid
						);

						this.standingOn = groundActors[0];

					}
					else if(!standingOnLeft)
					{
						const rightGroundPoint = [...this.groundPoint];

						rightGroundPoint[0] += half;

						const standingOnRight = this.getMapSolidAt(...rightGroundPoint);

						if(Array.isArray(standingOnRight) && standingOnRight.length)
						{
							const groundActors = standingOnRight.filter(
								a => a.args !== this.args && a.solid
							);

							this.standingOn = groundActors[0];

						}
						else if(!standingOnRight)
						{
							this.standingOn = null;
							this.args.falling = true;
						}
					}
				}
				else
				{
					this.standingOn = null;
					this.args.falling = true;
				}
			}
		}
		else
		{
			this.standingOn = null;
		}

		this.args.colliding = this.colliding;
	}

	updateGroundPosition()
	{
		let gSpeedMax = this.args.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		let nextPosition = [0, 0];

		if(this.args.gSpeed)
		{
			const max  = Math.abs(this.args.gSpeed);
			const step = Math.ceil(max / 64);

			const direction = Math.sign(this.args.gSpeed);

			for(let s = 0; s < max; s += step)
			{
				nextPosition = this.findNextStep(step * direction);

				if(!nextPosition)
				{
					break;
				}

				if(nextPosition[3])
				{
					this.args.gSpeed = 0;

					if(this.args.mode === MODE_LEFT || this.args.mode === MODE_RIGHT)
					{
						this.args.mode = MODE_FLOOR;
						this.lastAngles = [];
					}

					break;
				}
				else if(nextPosition[2] === true)
				{
					nextPosition[0] = step;
					nextPosition[1] = 0;

					this.args.ySpeed  = 0;

					switch(this.args.mode)
					{
						case MODE_FLOOR:
							this.args.xSpeed = this.args.gSpeed;
							this.args.falling = true;
							break;

						case MODE_CEILING:
							this.args.xSpeed = -this.args.gSpeed;
							this.args.falling = true;
							break;

						case MODE_LEFT:
							if(Math.abs(this.args.gSpeed) < 50)
							{
								this.args.mode = MODE_FLOOR;
								this.args.y--;
								this.args.x += this.args.direction;
							}
							else
							{
								this.args.ySpeed = this.args.gSpeed;
								this.args.xSpeed = 0;
								this.args.ignore = 8;
								this.args.falling = true;
							}
							break;

						case MODE_RIGHT:
							if(Math.abs(this.args.gSpeed) < 50)
							{
								this.args.mode = MODE_FLOOR;
								this.args.y--;
								this.args.x += this.args.direction;
							}
							else
							{
								this.args.ySpeed = -this.args.gSpeed;
								this.args.xSpeed = 0;
								this.args.ignore = 8;
								this.args.falling = true;
							}
							break;
					}

					this.args.gSpeed = 0;

					break;
				}
				else if(!nextPosition[0] && !nextPosition[1])
				{
					switch(this.args.mode)
					{
						case MODE_FLOOR:
						case MODE_CEILING:
							this.args.gSpeed = 0;
							break;

						case MODE_LEFT:
						case MODE_RIGHT:

							break;
					}
				}
				else if((nextPosition[0] || nextPosition[1]) && !this.rotateLock)
				{
					this.args.angle = nextPosition[0]
						? (Math.atan(nextPosition[1] / nextPosition[0]))
						: (nextPosition[1] > 0 ? Math.PI / 2 : -Math.PI / 2);

					this.lastAngles.unshift(this.args.angle);

					this.lastAngles.splice(this.angleAvg);
				}

				if(!this.rotateLock)
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

					if(this.args.angle > Math.PI / 4 && this.args.angle < Math.PI / 2)
					{

						this.lastAngles = this.lastAngles.map(n => n - Math.PI / 2);

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

						this.args.groundAngle -= Math.PI / 2;
					}
					else if(this.args.angle < -Math.PI / 4 && this.args.angle > -Math.PI / 2)
					{
						const orig = this.args.mode;

						this.lastAngles = this.lastAngles.map(n => n + Math.PI / 2);

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

						this.args.groundAngle += Math.PI / 2;
					}
				}
			}
		}
		else if(this.args.stopped === 1)
		{
			const sensorSpread = this.args.width / 2;

			const backPosition = this.findNextStep(-sensorSpread);
			const forePosition = this.findNextStep(sensorSpread);

			if(nextPosition[0] === false && nextPosition[1] === false)
			{
				this.args.falling = true;
			}

			if((nextPosition[0] || nextPosition[1]) && !this.rotateLock)
			{
				this.args.angle = Math.atan2(forePosition[1] - backPosition[1], sensorSpread*2+1);
				this.lastAngles.unshift(this.args.angle);
				this.lastAngles.splice(this.angleAvg);
			}
		}

		if(nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false))
		{
			if(Math.abs(this.args.gSpeed) > gSpeedMax && gSpeedMax !== Infinity && gSpeedMax !== -Infinity)
			{
				this.args.gSpeed = gSpeedMax * Math.sign(this.args.gSpeed);
			}
		}
		else
		{
			this.args.ignore = this.args.ignore || 1;

			this.args.gSpeed = 0;
		}

		if(this.willJump)
		{
			this.willJump = false;
			this.doJump();
		}
	}

	updateAirPosition()
	{
		let lastPoint = [this.x, this.y];
		let lastForePoint = [this.x, this.y];

		const tileMap = this.viewport.tileMap;

		const cSquared = this.args.xSpeed**2 + this.args.ySpeed**2;

		const airSpeed = cSquared ? Math.sqrt(cSquared) : 0;

		const viewport = this.viewport;

		if(this.args.flying)
		{
			const frontEdge = (1 + (Math.floor(this.args.width / 2)) * this.args.direction);

			const midHeight = Math.floor(this.args.height / 2);

			const foreHeadDistance = this.castRay(
				Math.abs(this.args.xSpeed) + 1
				, this.args.xSpeed < 0 ? Math.PI : 0
				, [frontEdge, -(-1 + this.args.height + this.args.yMargin)]
				, (i, point) => {

					const actors = viewport.actorsAtPoint(...point)
						.filter(x => x.args !== this.args)
						.filter(x => x.callCollideHandler(this))
						.filter(x => x.isSolid);

					if(actors.length > 0)
					{
						return i+1;
					}

					if(tileMap.getSolid(...point, this.args.layer))
					{
						return i+1;
					}
				}
			);

			if(foreHeadDistance)
			{
				this.args.x += ((-1+foreHeadDistance) * this.args.direction);

				this.args.xSpeed = 0;
			}

			const foreDistance = this.castRay(
				Math.abs(this.args.xSpeed) + 1
				, this.args.xSpeed < 0 ? Math.PI : 0
				, [frontEdge, this.isVehicle ? -this.args.height : -midHeight]
				, (i, point) => {

					const actors = viewport.actorsAtPoint(...point)
						.filter(x => x.args !== this.args)
						.filter(x => x.callCollideHandler(this))
						.filter(x => x.isSolid);

					if(actors.length > 0)
					{
						return i+1;
					}

					if(tileMap.getSolid(...point, this.args.layer))
					{
						return i+1;
					}
				}
			);

			if(foreDistance)
			{
				this.args.x += ((-1+foreDistance) * this.args.direction);

				this.args.xSpeed = 0;
			}
		}

		const airPoint = this.castRay(
			airSpeed
			, this.args.airAngle
			, (i, point) => {

				const actors = viewport.actorsAtPoint(...point)
					.filter(x => x.args !== this.args)
					.filter(x => x.callCollideHandler(this))
					.filter(x => x.isSolid);

				if(actors.length > 0)
				{
					return lastPoint;
				}

				if(tileMap.getSolid(...point, this.args.layer))
				{
					return lastPoint;
				}

				lastPoint = point.map(Math.floor);
			}
		);

		this.willJump = false;

		let blockers = false;

		const upMargin = this.args.flying ? (this.args.height + this.args.yMargin) : 0;

		const upDistance = this.castRay(
			Math.abs(this.args.ySpeed) + upMargin + 1
			, this.upAngle
			, (i, point) => {

				if(!this.viewport)
				{
					return false;
				}

				const actors = this.viewport.actorsAtPoint(...point)
					.filter(x => x.args !== this.args)
					.filter(x => x.callCollideHandler(this))
					.filter(a => a.solid);

				if(actors.length > 0)
				{
					return i;
				}

				if(tileMap.getSolid(...point, this.args.layer))
				{
					return i;
				}
			}
		);

		const xSpeedOriginal = this.args.xSpeed;
		const ySpeedOriginal = this.args.ySpeed;

		if(this.args.ySpeed < 0 && upDistance !== false)
		{
			this.args.ignore = 1;

			this.args.y -= Math.floor(upDistance - upMargin);
			this.args.ySpeed = 0;

			blockers = this.getMapSolidAt(this.x, this.y);

			if(Array.isArray(blockers))
			{
				const stickers = blockers.filter(a=>a.canStick);

				if(this.willStick && stickers.length)
				{
					this.args.gSpeed = Math.floor(-xSpeedOriginal);
					this.args.mode = MODE_CEILING;
					this.args.falling = false;
				}
			}
			else if(this.willStick)
			{
				const blockers = this.getMapSolidAt(this.x, this.y-1);
				const stickers = Array.isArray(blockers) && blockers.filter(a=>a.canStick);

				if(!blockers.length || (blockers.length && stickers.length))
				{
					this.args.gSpeed = Math.floor(-xSpeedOriginal);
					this.args.mode = MODE_CEILING;
					this.args.falling = false;
				}
			}
		}
		else if(airPoint !== false)
		{
			this.args.ignore = 1;

			const direction = Math.sign(this.args.xSpeed);

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;

			this.args.x = Math.floor(airPoint[0]);
			this.args.y = Math.floor(airPoint[1]);

			blockers = this.getMapSolidAt(this.x + direction, this.y);

			if(!blockers)
			{
				this.args.gSpeed = Math.floor(xSpeedOriginal);
				this.args.mode   = MODE_FLOOR;

				this.args.falling = false;
			}
			else if(Array.isArray(blockers))
			{
				if(this.willJump)
				{
					this.args.xSpeed *= -1.1;
					this.args.ySpeed *= -1.1;

					this.willJump = false;
				}
				else
				{
					blockers = blockers.filter(a => a.callCollideHandler(this));

					if(blockers.length && this.willStick)
					{
						if(blockers.filter(a => a.canStick).length)
						{
							this.args.falling = false;

							this.args.gSpeed = Math.floor(ySpeedOriginal * -direction);

							this.args.mode = direction < 0
								? MODE_LEFT
								: MODE_RIGHT;
						}

						this.args.ignore = 1;
					}
				}
			}
			else if(this.willJump)
			{
				this.args.xSpeed *= -1;
				this.args.ySpeed *= -1;

				this.willJump = false;
			}
			else if(this.willStick)
			{
				this.args.falling = false;

				this.args.gSpeed = Math.floor(ySpeedOriginal * -direction);

				this.args.mode = direction < 0
					? MODE_LEFT
					: MODE_RIGHT;
			}
		}
		else if(this.args.ySpeed > 0)
		{
			this.args.mode = DEFAULT_GRAVITY;

			this.args.gSpeed = Math.floor(xSpeedOriginal);
		}

		if(airPoint === false)
		{
			this.args.x += this.args.xSpeed;
			this.args.y += this.args.ySpeed;

			this.args.falling = true;
		}

		if(Math.abs(this.args.xSpeed) > this.args.xSpeedMax)
		{
			this.args.xSpeed = this.args.xSpeedMax * Math.sign(this.args.xSpeed);
		}

		if(Math.abs(this.args.ySpeed) > this.args.ySpeedMax)
		{
			this.args.ySpeed = this.args.ySpeedMax * Math.sign(this.args.ySpeed);
		}
	}

	callCollideHandler(other)
	{
		this.colliding = true;

		let type;

		this.args.collType = 'collision-intersect';

		type = -1;

		if(other.y <= this.y - this.args.height)
		{
			this.args.collType = 'collision-top';

			type = 0;
		}
		else if(other.x < this.x - Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-left';

			type = 1;
		}
		else if(other.x >= this.x + Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-right';

			type = 3;
		}
		else if(other.y >= this.y)
		{
			this.args.collType = 'collision-bottom';

			type = 2;
		}

		return this.collideA(other, type)
	}

	resolveIntersection()
	{
		let backAngle = this.args.airAngle;

		if(this.args.airAngle > 0)
		{
			backAngle -= Math.PI;
		}
		else
		{
			backAngle += Math.PI;
		}

		if(this.getMapSolidAt(this.x, this.y))
		{
			let testX = this.x;
			let testY = this.y;

			// this.args.ignore = 1;

			let blockers, b;

			while(true)
			{
				if(!this.viewport)
				{
					return;
				}

				b = this.getMapSolidAt(testX, testY);

				if(!b)
				{
					break;
				}

				blockers = b;

				if(Array.isArray(blockers))
				{
					blockers = blockers.filter(x=>x.args!==this.args).filter(x=>x.callCollideHandler(this));

					if(!blockers.length)
					{
						break;
					}
				}

				if(!this.args.xSpeed && !this.args.ySpeed)
				{
					testY--;
				}
				else
				{
					testX += Math.cos(backAngle);
					testY += Math.sin(backAngle);
				}
			}

			if(Array.isArray(blockers))
			{
				if(blockers.filter(a => a.canStick).length || this.getMapSolidAt(testX, testY + 1))
				{
					this.args.falling = false;
				}
				else
				{
					this.args.falling = true;
				}

				this.args.ySpeed = 0;
				this.args.xSpeed = 0;
			}
			else if(blockers)
			{
				this.args.falling = false;
			}

			this.args.x = testX;
			this.args.y = testY;

			this.willJump = false;
		}
	}

	processInput()
	{
		if(this.standingOn && this.standingOn.isVehicle)
		{
			const vehicle = this.standingOn;

			vehicle.xAxis = this.xAxis;
			vehicle.yAxis = this.yAxis;

			this.processInputVehicle();

			this.args.direction = vehicle.args.direction;
			this.args.facing    = vehicle.args.facing;
			this.args.layer     = vehicle.args.layer;

			const seatX = (vehicle.args.seatX || 0) * this.args.direction;
			const seatY = (vehicle.args.seatY || 0);

			this.args.x = vehicle.args.x + seatX;
			// this.args.y = vehicle.args.y + vehicle.args.height + seatY;
		}
		else
		{
			this.processInputDirect();
		}
	}

	processInputDirect()
	{
		if(this.args.ignore !== 0)
		{
			return
		}

		let gSpeedMax = this.args.gSpeedMax;

		if(this.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(this.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		if(!this.args.falling)
		{
			if(this.xAxis)
			{
				if(this.args.gSpeed < gSpeedMax && this.args.gSpeed > -gSpeedMax)
				{
					let gSpeed = this.args.gSpeed

					if(Math.sign(this.xAxis) === Math.sign(this.args.gSpeed))
					{
						gSpeed += (this.xAxis * this.args.accel);
					}
					else
					{
						gSpeed += (this.xAxis * this.args.accel) * 2;
					}

					gSpeed = Math.floor(gSpeed * 1000) / 1000;

					this.args.gSpeed = gSpeed;
				}
			}
			else if(Math.abs(this.args.gSpeed) < this.args.decel)
			{
				this.args.gSpeed = 0;
			}
			else if(this.args.gSpeed > 0)
			{
				this.args.gSpeed -= this.args.decel;
			}
			else if(this.args.gSpeed < 0)
			{
				this.args.gSpeed += this.args.decel;
			}
		}
		else if(this.xAxis)
		{
			this.args.xSpeed += this.xAxis * 0.3;
		}

		if(this.xAxis < 0)
		{
			this.args.facing = 'left';
			this.args.direction = -1;
		}

		if(this.xAxis > 0)
		{
			this.args.facing = 'right';
			this.args.direction = 1;
		}
	}

	processInputVehicle()
	{
		this.standingOn.processInputDirect();
	}

	collideA(other,type)
	{
		other.collideB(this);

		return this.solid;
	}

	collideB(other,type)
	{
		if(other.y <= this.y - this.args.height)
		{
			this.args.collType = 'collision-top';
		}
		else if(other.x < this.x - Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-left';
		}
		else if(other.x >= this.x + Math.floor(this.args.width/2))
		{
			this.args.collType = 'collision-right';
		}
		else if(other.y >= this.y)
		{
			this.args.collType = 'collision-bottom';
		}

		this.colliding = true;
	}

	findNextStep(offset)
	{
		if(!this.viewport)
		{
			return;
		}

		const viewport = this.viewport;
		const tileMap  = viewport.tileMap;
		const maxStep  = this.maxStep;

		const sign = Math.sign(offset);

		let downFirstSolid = false;
		let upFirstSpace   = false;

		let prevUp = 0, prevDown = 0, prev = 0;

		let col = 0;
		for(; col < Math.abs(offset); col++)
		{
			downFirstSolid = false;
			upFirstSpace   = false;

			let offsetPoint;

			const columnNumber = (1 + col) * sign;

			switch(this.args.mode)
			{
				case MODE_FLOOR:
					offsetPoint = [columnNumber, 1]
					break;

				case MODE_RIGHT:
					offsetPoint = [1, -columnNumber]
					break;

				case MODE_CEILING:
					offsetPoint = [-columnNumber, -1]
					break;

				case MODE_LEFT:
					offsetPoint = [-1, columnNumber]
					break;
			}

			downFirstSolid = this.castRay(
				maxStep * (1+col)
				, this.downAngle
				, offsetPoint
				, (i, point) => {
					const actors = viewport.actorsAtPoint(...point)
						.filter(a => a.args !== this.args)
						.filter(a => (i <= 1 || this.args.gSpeed) && a.callCollideHandler(this))
						.filter(a => a.solid);

					if(actors.length > 0)
					{
						return i;
					}

					if(tileMap.getSolid(...point, this.args.layer))
					{
						return i;
					}
				}
			);

			if(downFirstSolid === false)
			{
				return [false, false, true];
			}

			const downDiff = Math.abs(prevDown - downFirstSolid);

			if(Math.abs(downDiff) > maxStep)
			{
				return [false, false, false, true];
			}

			if(downFirstSolid === 0)
			{
				let offsetPoint;

				switch(this.args.mode)
				{
					case MODE_FLOOR:
						offsetPoint = [columnNumber, 0]
						break;

					case MODE_RIGHT:
						offsetPoint = [0, -columnNumber]
						break;

					case MODE_CEILING:
						offsetPoint = [-columnNumber, 0]
						break;

					case MODE_LEFT:
						offsetPoint = [0, columnNumber]
						break;
				}

				const upLength = +1 + maxStep * (1 + col);

				upFirstSpace = this.castRay(
					upLength
					, this.upAngle
					, offsetPoint
					, (i, point) => {
						const actors = viewport.actorsAtPoint(...point)
							.filter(x => x.args !== this.args)
							.filter(a => (i <= 1 || this.args.gSpeed) && a.callCollideHandler(this))
							.filter(x => x.solid);

						if(actors.length === 0)
						{
							if(!tileMap.getSolid(...point, this.args.layer))
							{
								return i;
							}
						}

					}
				);

				const upDiff = Math.abs(prevUp - upFirstSpace);

				if(upFirstSpace === false)
				{
					return [false, false, false, true];
					return [(1+col) * sign, false, false, true];
				}

				if(upDiff > maxStep)
				{
					return [false, false, false, true];
					return [(-1+col), prev, false, true];
				}

				prev = prevUp = upFirstSpace;
			}
			else
			{
				prev = prevDown = downFirstSolid;
			}
		}

		if(upFirstSpace !== false)
		{
			return [col * sign, upFirstSpace, false];
		}

		return [col * sign, -downFirstSolid, false];
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

		let force = this.args.jumpForce;

		if(this.running)
		{
			force = force * 1.5;
		}
		else if(this.crawling)
		{
			force = force * 0.5;
		}

		const originalMode = this.args.mode;

		this.args.ignore  = 1;
		this.args.landed  = false;
		this.args.falling = true;

		const angle = this.args.angle || 0;

		switch(originalMode)
		{
			case MODE_FLOOR:

				this.args.xSpeed = this.args.gSpeed * Math.sin(angle + Math.PI/2);
				this.args.ySpeed = this.args.gSpeed * Math.cos(angle + Math.PI/2);

				this.args.xSpeed += force * Math.cos(angle + Math.PI/2);
				this.args.ySpeed -= force * Math.sin(angle + Math.PI/2);

				break;

			case MODE_LEFT:

				this.args.xSpeed = -this.args.gSpeed * Math.cos(angle + Math.PI/2);
				this.args.ySpeed =  this.args.gSpeed * Math.sin(angle + Math.PI/2);

				this.args.xSpeed -= force * Math.sin(angle - Math.PI/2);
				this.args.ySpeed -= force * Math.cos(angle - Math.PI/2);

				break;

			case MODE_CEILING:

				this.args.xSpeed = -this.args.gSpeed * Math.sin(angle + Math.PI/2);
				this.args.ySpeed = -this.args.gSpeed * Math.cos(angle + Math.PI/2);

				this.args.xSpeed -= force * Math.cos(angle + Math.PI/2);
				this.args.ySpeed += force * Math.sin(angle + Math.PI/2);

				break;

			case MODE_RIGHT:

				this.args.xSpeed =  this.args.gSpeed * Math.cos(angle + Math.PI/2);
				this.args.ySpeed = -this.args.gSpeed * Math.sin(angle + Math.PI/2);

				this.args.xSpeed += force * Math.sin(angle - Math.PI/2);
				this.args.ySpeed += force * Math.cos(angle - Math.PI/2);

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

	sleep()
	{
		// this.actorTag = this.tags.actor;

		// this.tags.actor.node.remove();
	}

	wakeUp()
	{
	}

	impulse(magnitude, direction, willFall = false)
	{
		this.impulseMag = magnitude;
		this.impulseDir = direction;
		this.impulseFal = willFall;
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

	scanVerticalEdge(direction = 1)
	{
		const tileMap = this.viewport.tileMap;

		return this.castRay(
			this.args.height + 1
			, Math.PI / 2
			, [direction * this.args.width / 2, -this.args.height]
			, (i,point) => {

				const actors = this.viewport
					.actorsAtPoint(...point)
					.filter(a => a.args !== this.args);

				if(actors.length || tileMap.getSolid(...point, this.args.layer))
				{
					return i;
				}
			}
		);
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

	get groundPoint()
	{
		switch(this.args.mode)
		{
			case MODE_FLOOR:
				return [this.x + 0, this.y + 1];
				break;

			case MODE_RIGHT:
				return [this.x + 1, this.y + 0];
				break;

			case MODE_CEILING:
				return [this.x + 0, this.y - 1];
				break;

			case MODE_LEFT:
				return [this.x - 1, this.y + 0];
				break;
		}
	}

	// get leftPoint()
	// {
	// 	const halfWidth  = Math.floor(this.args.width  / 2);
	// 	const halfHeight = Math.floor(this.args.height / 2);

	// 	return [this.x - halfWidth, this.y - halfHeight];
	// }

	// get rightPoint()
	// {
	// 	const halfWidth  = Math.floor(this.args.width  / 2);
	// 	const halfHeight = Math.floor(this.args.height / 2);

	// 	return [this.x + halfWidth, this.y - halfHeight];
	// }

	// get topPoint()
	// {
	// 	return [this.x, this.y - this.args.height];
	// }

	getMapSolidAt(x, y, actors = true)
	{
		if(!this.viewport)
		{
			return;
		}

		if(actors)
		{
			const actors = this.viewport.actorsAtPoint(x,y)
				.filter(x=>x.args!==this.args)
				.filter(x=>x.solid);

			if(actors.length > 0)
			{
				return actors;
			}
		}

		const tileMap = this.viewport.tileMap;

		return tileMap.getSolid(x,y, this.args.layer);
	}

	get canStick() { return false; }
	get isEffect() { return false; }
	get isVehicle() { return false; }
	get solid() { return false; }

	get x() { return this.args.x }
	get y() { return this.args.y }
	get point() { return [this.args.x, this.args.y] }
	get rotateLock() { return false; }

	command_0() // jump
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
}
