import { PointActor } from './PointActor';

export class BrokenMonitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor actor-monitor-broken';

		this.args.width  = 28;
		this.args.height = 16;
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
		return true;
	}

	collideB(other)
	{
		super.collideB(other);

		if(this.restingOn)
		{
			return true;
		}

		if(other.solid && this.args.collType === 'collision-bottom')
		{
			this.debindX && this.debindX();
			this.debindY && this.debindY();

			this.restingOn = other;

			// this.debindYs = other.args.bindTo('ySpeed', v => this.args.ySpeed = v);
			// this.debindXs = other.args.bindTo('xSpeed', v => this.args.xSpeed = v);
			// this.debindGs = other.args.bindTo('gSpeed', v => this.args.gSpeed = v);
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

	get solid() { return false; }
}
