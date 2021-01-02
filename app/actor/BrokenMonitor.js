import { PointActor } from './PointActor';

import { Explosion } from '../actor/Explosion';
// import { BrokenMonitor } from '../actor/BrokenMonitor';

export class BrokenMonitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor actor-monitor-broken';

		this.args.width  = 28;
		this.args.height = 32;
	}

	update()
	{
		super.update();

		if(!this.restingOn)
		{
			this.debindYs && this.debindYs();
			this.debindXs && this.debindXs();
			this.debindGs && this.debindGs();
			this.debindX  && this.debindX();
			this.debindY  && this.debindY();
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(this.args.float === -1 && this.args.collType === 'collision-bottom')
		{
			this.args.float = 1;

			const maxBounce = 6;

			const speed = other.args.ySpeed;

			if(Math.abs(speed) < maxBounce)
			{
				this.args.ySpeed = speed;
			}
			else
			{
				this.args.ySpeed = -maxBounce;
			}

			other.args.ySpeed = 0;

			return true;
		}

		return true;
	}

	collideB(other)
	{
		super.collideB(other);

		if(this.restingOn)
		{
			return true;
		}

		if(other.solid && this.args.collType === 'collision-bottom' && other.y > this.y)
		{
			this.debindYs && this.debindYs();
			this.debindXs && this.debindXs();
			this.debindGs && this.debindGs();
			this.debindX  && this.debindX();
			this.debindY  && this.debindY();

			this.restingOn = other;

			this.debindYs = other.args.bindTo('ySpeed', v => this.args.gSpeed = v);
			this.debindXs = other.args.bindTo('xSpeed', v => this.args.gSpeed = v);
			this.debindGs = other.args.bindTo('gSpeed', v => this.args.gSpeed = v);
			this.debindX  = other.args.bindTo('x', v => this.args.x = v);
			this.debindY  = other.args.bindTo('y', v => this.args.y = v - this.args.height);

			this.onRemove(()=>{
				this.debindYs && this.debindYs();
				this.debindXs && this.debindXs();
				this.debindGs && this.debindGs();
				this.debindX  && this.debindX();
				this.debindY  && this.debindY();
			});
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return false; }
}
