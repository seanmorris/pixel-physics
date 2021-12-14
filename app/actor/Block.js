import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { QuintInOut } from 'curvature/animate/ease/QuintInOut';
import { CubicInOut } from 'curvature/animate/ease/CubicInOut';

export class Block extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;
		obj.args.tileId = objDef.gid;

		// obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.yForce = 0;
		this.args.yLean  = 0;

		this.args.type = 'actor-item actor-block';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;

		this.args.ySpeedMax = 16;

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.solid = true;

		this.args.gravity = 0.4;

		this.args.collapse = args.collapse ?? false;

		this.args.active = -1;
	}

	onAttached(event)
	{
		if(this.args.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ];
		}

		super.onRendered(event);

		this.droop(0);

		// if(this.screen)
		// {
		// 	return;
		// }

		// this.screen = new Tag(`<input type = "text" placeholder = "this effect is dynamic">`);
		// this.screen2 = new Tag(`<input tabindex = "0" type = "button" value = "submit">`);

		// this.sprite.appendChild(this.screen.node);
		// this.sprite.appendChild(this.screen2.node);

		// this.screen.style({'pointer-events':'initial', 'z-index': 1000});

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';
	}

	collideA(other, type)
	{
		if(other.isRegion)
		{
			return false;
		}

		if(other instanceof this.constructor)
		{
			return false;
		}

		if(!other.args.falling
			&& this.args.droop
			&& other.args.ySpeed >= 0
			&& other.args.standingOn !== this
		){
			return true;
		}

		if(this.args.droop && other.controllable && (type === 0 || type === 2) && other.args.ySpeed >= 0)
		{
			const blockTop = this.originalY + -this.args.height;
			const half     = Math.floor(this.args.width / 2);
			const speed    = other.args.gSpeed;
			const absSpeed = Math.abs(speed);

			if(absSpeed > half)
			{
				this.args.y      = this.originalY;
				other.args.y     = blockTop + -1;
				this.args.yForce = 0;
				this.args.yLean  = 0;

				return true;
			}

			const pos    = ((this.x + -other.x + -(speed * 2)) / half);
			const droop  = Number(this.args.droop) * 0.9;
			const absPos = Math.abs(pos);

			// this.screen.placeholder = `drooping at ${pos.toFixed(2)}`;

			if(absPos >= 0.9)
			{
				this.args.yForce = 0;
				this.args.yLean = (this.args.yLean / 100);

				return true;
			}

			const yForceMax = Math.round(droop * (1 - Math.abs(pos)) / 2);

			this.args.yForce += Math.max(other.ySpeedLast, 0);
			this.args.yForce  = Math.min(yForceMax, this.args.yForce);
			this.args.yForce  = Math.max(this.args.yForce, -yForceMax);

			this.droopPos = (this.x - other.x);

			// if(this.args.output)
			// {
			// 	const output = this.viewport.actorsById[ this.args.output ];

			// 	if(output)
			// 	{
			// 		output.args.content = this.screen.value;
			// 	}
			// }
		}

		if(type === -1 && !this.args.platform && other.controllable && other.args.ySpeed)
		{
			if(other.args.y < this.args.y)
			{
				other.args.y = this.y + -this.args.height + this.args.ySpeed + -1;

				if(other.args.ySpeed < 0)
				{
					other.args.ySpeed = this.args.ySpeed
				}
			}
			else
			{
				other.args.y = this.y + other.args.height + -this.args.ySpeed + 1;
				other.args.ySpeed = this.args.ySpeed;
			}
			return;
		}

		if(this.args.platform)
		{
			if(other.willStick)
			{
				return false;
			}

			const otherTop  = other.y - other.args.height;
			const blockTop  = this.y  - this.args.height;
			const halfWidth = this.args.width / 2;

			if(other.args.falling
				&& other.y - blockTop < 16
				&& other.args.ySpeed >= 0
				&& Math.abs(other.x - this.x) < (halfWidth - 16)
			){
				other.args.y = -1 + blockTop;
			}

			if((other.y <= blockTop) && (other.args.falling === false || other.args.ySpeed > 0))
			{
				return true;
			}

			return false;
		}

		if(!other.controllable && !other.isVehicle)
		{
			return true;
		}

		if(this.args.collapse && (type === 0 || type === 2) && this.args.float <= 0)
		{
			if(other.args.ySpeed > 15)
			{
				this.args.float = 1;

				this.args.goBack = false;

				const ySpeed = other.args.ySpeed;

				this.onNextFrame(()=>{
					if(this.args.falling || this.args.float)
					{
						this.args.ySpeed = ySpeed;
						this.args.float  = 1;
					}
					else
					{
						this.args.ySpeed = -1;
						this.args.float  = 1;
					}

					this.args.falling = true;

				});
			}
			else if(other.args.ySpeed > 0 || other.args.gSpeed)
			{
				this.args.float = this.args.float > 0 ? this.args.float : 30;
			}
		}

		return true;
	}

	onAttach(event)
	{
		if(!this.viewport)
		{
			return;
		}

		this.args.collapse && this.tags.sprite.classList.add('collapse');
		this.args.platform && this.tags.sprite.classList.add('platform');

		if(this.args.hidden)
		{
			event && event.preventDefault();

			return false;
		}

		this.viewport.tileMap.ready.then(event => {

			const tile = this.viewport.tileMap.getTile(this.args.tileId-1);

			if(!tile)
			{
				return;
			}

			this.args.spriteX = tile[0];
			this.args.spriteY = tile[1];

			this.args.spriteSheet = tile[2];

		});
	}

	activate()
	{
		this.args.active = true;
	}

	deactivate()
	{
		this.args.active = false;
	}

	update()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.collapse)
		{
			this.args.gSpeed = 0;
		}

		if(this.args.float && (this.args.oscillateX || this.args.oscillateY))
		{
			const current = Math.cos(Math.sin(this.viewport.args.frameId/90)**5)**(5*3.333);

			if(this.args.oscillateX)
			{
				const moveX = Math.round(current * this.args.oscillateX);

				this.args.x = this.originalX - moveX;
			}

			if(this.args.oscillateY)
			{
				const moveY = Math.round(current * this.args.oscillateY);

				this.args.y = this.originalY - moveY;
			}
		}

		if(this.args.collapse)
		{
			if(!this.reset && !this.args.once)
			{
				this.reset = true;

				this.viewport.onFrameOut(300, () => {
					this.args.groundAngle = 0;
					this.args.falling = true;
					this.args.goBack = true;
					this.args.float = -1;
					this.reset = false;
				});
			}

			if(this.args.goBack)
			{
				this.args.float = -1;

				this.noClip = true;

				const distX = this.originalX - this.args.x;
				const distY = this.originalY - this.args.y;

				this.args.xSpeed = 0;
				this.args.ySpeed = 0;
				this.args.gSpeed = 0;

				if(Math.abs(distX) > 3)
				{
					this.args.x += Math.sign(distX) * 3;
				}
				else
				{
					this.args.x	= this.originalX;
				}

				if(Math.abs(distY) > 3)
				{
					this.args.y += Math.sign(distY) * 3;
				}
				else
				{
					this.args.y	= this.originalY;
				}

				if(this.args.x === this.originalX && this.args.y === this.originalY)
				{
					this.args.goBack = false;
					this.noClip = false;
				}

				this.args.groundAngle = 0;
				this.args.airAngle = 0;
			}
		}
		else if(this.args.droop)
		{
			this.snapBack = this.snapBack || false;

			if(!this.args.colliding && this.args.yForce && this.viewport)
			{
				this.viewport.onFrameOut(4, () => {
					if(!this.args.colliding)
					{
						this.snapBack = true;
					}
				});
			}

			if(!this.args.colliding && this.args.yForce && this.snapBack)
			{
				this.args.yForce *= 0.15;
			}

			if(Math.abs(this.args.yForce) <= 1)
			{
				// this.screen.placeholder = `flat.`;
				this.snapBack = false;
			}

			if(this.args.yForce !== this.args.yLean)
			{
				const diff = this.args.yLean - this.args.yForce;
				const step = this.args.yForce > this.args.yLean
					? Math.abs(diff) * 0.666
					: Math.abs(diff) * 0.333;

				this.args.yLean -= Math.sign(diff) * step;

				if(Math.abs(diff) < step)
				{
					this.args.yLean = this.args.yForce;
				}
			}

			if(!this.args.yLean)
			{
				this.args.y = this.originalY;
			}
			else
			{
				this.args.y = Math.ceil(this.originalY + this.args.yLean) || this.originalY;
				this.droop(-1 * this.args.yLean, this.droopPos || 0);
				// this.onNextFrame(() => {
				// 	this.args.y = Math.ceil(this.originalY + this.args.yLean) || this.originalY;
				// 	this.droop(-1 * this.args.yLean, this.droopPos || 0);
				// });
			}
		}

		super.update();
	}

	updateEnd()
	{
		super.updateEnd();

		// if(!this.viewport.collisions.has(this))
		// {
		// 	return;
		// }

		// const collidees = this.viewport.collisions.get(this);

		// for(const [collidee, type] of collidees)
		// {
		// 	console.log(type);
		// }
	}

	sleep()
	{
		if(this.args.collapse && this.args.once && !this.args.float)
		{
			this.viewport.actors.remove(this);
		}
	}

	popOut(other)
	{
		if(this.args.platform)
		{
			return;
		}

		super.popOut(other);
	}

	get rotateLock() { return true; }
	get canStick() { return !this.args.platform; }
	get solid() { return (!this.args.collapse || (this.args.float !== 0 || !this.args.goBack)); }
}

