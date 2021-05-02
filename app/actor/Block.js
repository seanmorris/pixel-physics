import { PointActor } from './PointActor';

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

		obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(args = {})
	{
		super(args);

		this.args.yForce = 0;

		this.args.type = 'actor-item actor-block';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.solid = true;

		this.args.gravity = 0.5;

		this.args.collapse = args.collapse ?? false;

		this.ease = new QuintInOut(this.public.period);

		this.ease.start();
	}

	collideA(other, type)
	{
		if(other instanceof this.constructor)
		{
			return false;
		}

		if(this.public.droop && (type === 0 || type === 2))
		{
			const droop = Number(this.public.droop);
			const half  = Math.floor((this.args.width - Math.abs(other.public.gSpeed)) / 2);
			const pos   = ((this.x - other.x) / half);

			this.droopPos = (this.x - other.x);

			const yForceMax = Math.round(droop * (1 - Math.abs(pos)) * 4) / 4;

			this.args.droopSpeed = other.args.ySpeed || this.args.droopSpeed || 4;

			if(!other.args.falling && this.args.droopSpeed > 6)
			{
				this.args.droopSpeed--;

				if(Math.abs(this.args.droopSpeed) < 6)
				{
					this.args.droopSpeed = 6;
				}
			}

			this.args.yForce += Math.max(other.args.ySpeed || this.args.droopSpeed, 4);

			if(other.public.gSpeed > half)
			{
				this.args.yForce = 0;
			}

			this.args.yForce = Math.min(yForceMax, this.public.yForce);

			if(other.args.falling)
			{
				this.args.yForce = Math.max(this.args.yForce, -yForceMax);
			}
			else
			{
				this.args.yForce = Math.max(this.args.yForce, 0);
			}

			if(Math.abs(this.args.yForce) <= 1)
			{
				this.args.yForce = 0;
				this.args.y = this.originalY
			}
		}

		if(this.public.platform)
		{
			const otherTop = other.y - other.public.height;
			const blockTop = this.y - this.public.height;

			if(other.public.falling === false || (other.public.ySpeed > 0 && other.y <= blockTop))
			{
				return true;
			}

			return false;
		}

		if(!other.controllable && !other.isVehicle)
		{
			return true;
		}

		if(this.args.float > 0)
		{
			return true;
		}

		if(this.public.collapse && (type === 0 || type === 2))
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
				this.args.float = 5;
			}
		}

		return true;
	}

	onAttached(event)
	{
		this.public.collapse && this.tags.sprite.classList.add('collapse');
		this.public.platform && this.tags.sprite.classList.add('platform');
	}

	onAttach(event)
	{
		if(this.public.hidden)
		{
			event && event.preventDefault();

			return false;
		}

		this.viewport.tileMap.ready.then(event => {

			const tile = this.viewport.tileMap.getTile(this.public.tileId);

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

	update()
	{
		if(this.public.collapse)
		{
			this.args.gSpeed = 0;
		}

		super.update();

		if(this.public.float && (this.public.oscillateX || this.public.oscillateY))
		{
			const current = this.ease.current();

			if(this.ease.done && !this.nextEase)
			{
				const reverse = this.ease.reverse;

				const Ease = QuintInOut;

				this.nextEase = new Ease(this.public.period, {reverse: !reverse});
			}

			if(this.nextEase)
			{
				this.ease = this.nextEase;
				this.nextEase = false;

				this.viewport.onFrameOut(60, () => {
					this.ease.start();
				});
			}

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

		if(this.public.collapse)
		{
			if(!this.reset)
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

			if(this.public.goBack)
			{
				this.args.float = -1;

				const distX = this.originalX - this.public.x;
				const distY = this.originalY - this.public.y;

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
				}

				this.args.groundAngle = 0;
				this.args.airAngle = 0;
			}
		}
		else if(this.public.droop)
		{
			this.snapBack = this.snapBack || false;

			if(!this.args.colliding && this.args.yForce)
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
				this.args.yForce *= 0.45;
			}

			if(Math.abs(this.public.yForce) <= 1)
			{
				this.args.yForce = 0;
				this.snapBack = false;
			}

			this.args.y = Math.ceil(this.originalY + this.public.yForce) || this.originalY;

			this.droop(-1 * this.public.yForce, this.droopPos || 0);
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
	get canStick() { return true; }
	get solid() { return (!this.public.collapse || (this.public.float !== 0 || !this.public.goBack)); }
}

