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

		obj.args.x = obj.originalX = 16 + Math.floor((objDef.x + Math.floor(objDef.width / 32) * 16) / 32) * 32;
		obj.args.y = obj.originalY = Math.floor(objDef.y / 32) * 32;

		return obj;
	}

	constructor(args = {})
	{
		super(args);

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

	onAttached()
	{
		this.public.collapse && this.tags.sprite.classList.add('collapse');
	}

	update()
	{
		if(this.public.collapse)
		{
			this.args.gSpeed = 0;
		}

		super.update();

		const current = this.ease.current();

		if(this.public.float && this.public.oscillateX)
		{
			const moveX = Math.round(current * this.public.oscillateX);

			this.args.x = this.originalX - moveX;
		}

		if(this.public.float && this.public.oscillateY)
		{
			const moveY = Math.round(current * this.public.oscillateY);

			this.args.y = this.originalY - moveY;
		}

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

		if(this.public.collapse)
		{
			if(!this.reset)
			{
				this.reset = true;

				this.viewport.onFrameOut(300, () => {
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
			}
		}
	}

	get rotateLock() { return true; }
	get canStick() { return true; }
	get solid() { return (!this.public.collapse) || (this.public.float !== 0 || !this.public.goBack); }
}

