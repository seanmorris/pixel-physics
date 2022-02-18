import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { Ring } from './Ring';

import { QuintInOut } from 'curvature/animate/ease/QuintInOut';
import { CubicInOut } from 'curvature/animate/ease/CubicInOut';

export class Block extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		// obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.yForce = 0;
		this.args.yLean  = 0;

		this.args.z = this.args.z ?? 100;

		this.args.type = 'actor-item actor-block';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;
		this.args.convey = args.convey ?? 0;

		this.args.conveyed = 0;

		this.args.ySpeedMax = 16;

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.solid = this.args.solid ?? true;

		this.args.gravity = 0.4;

		this.args.collapse = args.collapse ?? false;

		this.args.active = -1;

		this.weighted = false;

		// this.args.bindTo('spriteSheet', v => console.trace(v));
	}

	onAttached(event)
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.match)
		{
			this.match = this.viewport.actorsById[ this.args.match ];
		}

		// if(this.screen)
		// {
		// 	return;
		// }

		// this.screen = new Tag(`<input type = "text" placeholder = "this effect is dynamic">`);
		// this.screen2 = new Tag(`<input tabindex = "0" type = "button" value = "submit">`);

		// this.sprite.appendChild(this.screen.node);
		// this.sprite.appendChild(this.screen2.node);

		// this.screen.style({'pointer-events':'initial', 'z-index': 1000});

		if(!this.viewport)
		{
			event.preventDefault();
			return false;
		}

		this.setTile();

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';

		this.droop(0);

		this.args.collapse && this.tags.sprite.classList.add('collapse');
		this.args.platform && this.tags.sprite.classList.add('platform');

		if(this.args.hidden)
		{
			event && event.preventDefault();

			return false;
		}

		this.setTile();
	}

	collideA(other, type)
	{
		if(other.isRegion || other.noClip)
		{
			return false;
		}

		if(other.args.standingOn === this)
		{
			this.weighted = true;
		}

		if(other instanceof this.constructor && !other.args.falling)
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
			// if(other.args.y < this.args.y)
			// {
			// 	other.args.y = this.y + -this.args.height + this.args.ySpeed + -1

			// 	if(other.args.ySpeed < 0)
			// 	{
			// 		other.args.ySpeed = this.args.ySpeed
			// 	}
			// 	else
			// 	{
			// 		other.args.y = this.y + other.args.height + -this.args.ySpeed + 1;
			// 		other.args.ySpeed = this.args.ySpeed;
			// 	}
			// }

			if(other.args.y < this.args.y)
			{
				other.args.y = this.y + -this.args.height + this.args.ySpeed;
				other.args.ySpeed = this.args.ySpeed;
			}
			this.onNextFrame(() => {
				other.args.y = this.y + -this.args.height;
				other.args.falling = false;
			});

			return;
		}

		if(this.args.platform && !(other instanceof Ring))
		{
			// if(other.willStick)
			// {
			// 	return false;
			// }

			const otherTop  = other.y - other.args.height;
			const blockTop  = this.y  - this.args.height;
			const halfWidth = this.args.width / 2;

			if(other.args.falling
				&& other.y - blockTop < 16
				&& other.args.ySpeed >= 0
				&& !other.args.float
				&& Math.abs(other.x - this.x) < (halfWidth - 16)
			){
				if(other.controllable)
				{
					other.args.y = -1 + blockTop;
				}
				else
				{
					other.args.y = blockTop;
				}
			}

			if((other.y <= blockTop) && (other.args.falling === false || other.args.ySpeed > 0))
			{
				return true;
			}

			if(other.args.npc && !other.args.falling && this.args.falling && !this.args.float)
			{
				other.startle();
			}

			return false;
		}

		if(!other.controllable && !other.isVehicle)
		{
			return true;
		}

		if(!this.switch && this.args.collapse && (type === 0 || type === 2) && this.args.float <= 0)
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
				this.args.float = this.args.float >= 0 ? this.args.float : (this.args.delay || 0);
			}
		}

		return true;
	}

	onAttach(event)
	{

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

		if(this.args.switch && !this.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ];
		}

		if(this.args.collapse)
		{
			this.args.gSpeed = 0;

			if(this.switch && this.switch.args.active)
			{
				this.args.float  = this.args.float >= 0 ? this.args.float : (this.args.delay || 0);

				if(!this.args.float)
				{
					this.args.ySpeed = this.args.ySpeed || 12;
				}
			}
		}

		if(this.match)
		{
			this.args.convey = -this.match.args.convey;
		}

		this.xLast = this.args.x;
		this.yLast = this.args.y;

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

		if(!this.switch && this.args.collapse)
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

		this.box && this.box.style({'--convey':Math.abs(this.args.convey)});
		this.box && this.box.style({'--conveyDir':Math.sign(this.args.conveyed)});

		this.args.conveyed += this.args.convey;

		this.box && this.box.style({'--conveyed': this.args.conveyed*0.8});

		super.update();
	}

	updateStart()
	{
		this.weighted = false;
	}

	updateEnd()
	{
		super.updateEnd();

		// if(!this.viewport.collisions.has(this))
		// {
		// 	return;
		// }

		if(this.args.float && this.args.settle)
		{
			if(this.weighted && this.args.y < this.def.get('y') + this.args.settle)
			{
				this.args.y += Math.min(Math.abs(this.args.settle), 64) / 8 * Math.sign(this.args.settle);
			}

			if(!this.weighted && this.y > this.def.get('y'))
			{
				this.args.y -= Math.min(Math.abs(this.args.settle), 32) / 8 * Math.sign(this.args.settle);
			}
		}

		if(!this.viewport || !this.viewport.collisions.has(this))
		{
			return;
		}

		const collidees = this.viewport.collisions.get(this);

		if(this.args.treadmill)
		{
			this.args.convey = 0;

			let speedCount = 0;
			let speedSum = 0;

			for(const [collidee, type] of collidees)
			{
				if(collidee.args.standingOn !== this)
				{
					continue;
				}

				if(collidee.args.gSpeed)
				{
					speedCount++;
					speedSum += collidee.args.gSpeed;
				}
			}

			if(speedCount)
			{
				this.args.convey = -speedSum / speedCount;
			}
		}

		if(this.args.convey)
		{
			for(const [collidee, type] of collidees)
			{
				if(!collidee.controllable || collidee.args.falling)
				{
					continue;
				}

				const conveyTo = collidee.findNextStep(this.args.convey);

				if(conveyTo[3])
				{
					continue;
				}

				if(conveyTo[2])
				{
					collidee.args.xSpeed  = this.args.convey;
					collidee.args.ySpeed  = 0;
					collidee.args.falling = true;

					collidee.args.y = -1 + this.y - this.args.height;
				}

				collidee.args.x += conveyTo[0];
				collidee.args.y += conveyTo[1];
			}
		}
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
	get solid() { return this.args.solid && (!this.args.collapse || (this.args.float !== 0 || !this.args.goBack)); }
}

