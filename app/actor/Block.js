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

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.solid = true;

		this.args.gravity = 0.5;

		this.args.collapse = args.collapse ?? false;

		// this.moving = this.reverse = false;
		// this.remaining = 0;

		// this.ease = new QuintInOut(this.public.period);

		// this.args.active = this.args.active ?? -1;
		this.args.active = -1;

		// if(this.args.active)
		// {
		// 	this.ease.start();
		// }
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(this.screen)
		{
			return;
		}

		this.screen = new Tag(`<input type = "text" placeholder = "this effect is dynamic">`);
		this.screen2 = new Tag(`<input tabindex = "0" type = "button" value = "submit">`);

		// this.sprite.appendChild(this.screen.node);
		// this.sprite.appendChild(this.screen2.node);

		// this.screen.style({'pointer-events':'initial', 'z-index': 1000});

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';
	}

	collideA(other, type)
	{
		if(other instanceof this.constructor)
		{
			return false;
		}

		if(this.args.droop
			&& other.args.ySpeed >= 0
			&& other.args.standingOn !== this
		){
			return true;
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

		if(this.public.droop && (type === 0 || type === 2))
		{
			const blockTop = this.originalY + -this.public.height;
			const half     = Math.floor(this.args.width / 2);
			const speed    = other.public.gSpeed;
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
			const droop  = Number(this.public.droop) * 0.9;
			const absPos = Math.abs(pos);

			this.screen.placeholder = `drooping at ${pos.toFixed(2)}`;

			if(absPos >= 0.9)
			{
				this.args.yForce = 0;
				this.args.yLean = 0;

				return true;
			}

			const yForceMax = Math.round(droop * (1 - Math.abs(pos)) * 4) / 4;

			this.args.yForce += Math.max(other.args.ySpeed, 4);
			this.args.yForce  = Math.min(yForceMax, this.public.yForce);
			this.args.yForce  = Math.max(this.args.yForce, -yForceMax);

			this.droopPos = (this.x - other.x);

			if(this.args.output)
			{
				const output = this.viewport.actorsById[ this.args.output ];

				if(output)
				{
					output.args.content = this.screen.value;
				}
			}
		}

		if(this.public.platform)
		{
			if(other.willStick)
			{
				return false;
			}

			const otherTop = other.y - other.public.height;
			const blockTop = this.y  - this.public.height;

			if((other.y <= blockTop) && (other.public.falling === false || other.args.ySpeed > 0))
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
			if(other.public.ySpeed > 15)
			{
				this.args.float = 1;

				this.args.goBack = false;

				const ySpeed = other.public.ySpeed;

				this.onNextFrame(()=>{
					if(this.public.falling || this.public.float)
					{
						this.args.ySpeed = ySpeed;
						this.args.float  = 1;
					}
					else
					{
						this.args.ySpeed = -1;
						this.args.float  = 1;
					}

					this.public.falling = true;

				});
			}
			else if(other.public.ySpeed > 0 || other.public.gSpeed)
			{
				this.args.float = this.args.float > 0 ? this.args.float : 5;
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

		this.public.collapse && this.tags.sprite.classList.add('collapse');
		this.public.platform && this.tags.sprite.classList.add('platform');

		if(this.public.hidden)
		{
			event && event.preventDefault();

			return false;
		}

		this.viewport.tileMap.ready.then(event => {

			const tile = this.viewport.tileMap.getTile(this.public.tileId-1);

			if(!tile)
			{
				return;
			}

			this.args.spriteX = tile[0];
			this.args.spriteY = tile[1];

			this.args.spriteSheet = '/map/' + tile[2];

			if(this.public.droop)
			{
				this.droop(0);
			}

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

		if(this.public.collapse)
		{
			this.args.gSpeed = 0;
		}

		if(this.public.float && (this.public.oscillateX || this.public.oscillateY))
		{
			const current = Math.cos(Math.sin(this.viewport.args.frameId/90)**5)**(5*3.333);

			if(this.public.oscillateX)
			{
				const moveX = Math.round(current * this.public.oscillateX);

				this.args.x = this.originalX - moveX;
			}

			if(this.public.oscillateY)
			{
				const moveY = Math.round(current * this.public.oscillateY);

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

				if(this.public.x === this.originalX && this.args.y === this.originalY)
				{
					this.args.goBack = false;
					this.noClip = false;
				}

				this.args.groundAngle = 0;
				this.args.airAngle = 0;
			}
		}
		else if(this.public.droop)
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

			if(Math.abs(this.public.yForce) <= 1)
			{
				// this.screen.placeholder = `flat.`;
				this.snapBack = false;
			}

			if(this.args.yForce !== this.args.yLean)
			{
				const diff = this.args.yLean - this.args.yForce;
				const step = 16;

				this.args.yLean -= Math.sign(diff) * step;

				if(Math.abs(diff) < step)
				{
					this.args.yLean = this.args.yForce;
				}
			}

			if(!this.public.yLean)
			{
				this.args.y = this.originalY;
			}
			else
			{
				this.args.y = Math.ceil(this.originalY + this.public.yLean) || this.originalY;
				this.droop(-1 * this.public.yLean, this.droopPos || 0);
				this.onNextFrame(() => {
					this.args.y = Math.ceil(this.originalY + this.public.yLean) || this.originalY;
					this.droop(-1 * this.public.yLean, this.droopPos || 0);
				});
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
	get canStick() { return !this.public.platform; }
	get solid() { return (!this.public.collapse || (this.public.float !== 0 || !this.public.goBack)); }
}

