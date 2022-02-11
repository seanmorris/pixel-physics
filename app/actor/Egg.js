import { PointActor } from './PointActor';
import { Bindable } from 'curvature/base/Bindable';
import { EggShellTop } from './EggShellTop';
import { Chao } from './Chao';

export class Egg extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-egg';

		this.args.width  = 15;
		this.args.height = 20;

		this.broken = false;

		this.args.bindTo('falling', falling => {
			const impact = this.ySpeedLast;
			if(falling || this.broken || impact < 12) { return };

			this.args.type = 'actor-item actor-egg actor-egg-shell-bottom';

			const shellTop = new EggShellTop({
				ySpeed: -impact * 0.4
				, xSpeed: this.xSpeedLast * 0.6
				, x: this.x
				, y: this.y - 10
			});

			const chao = new Chao({
				ySpeed: -impact * 0.4
				, xSpeed: this.xSpeedLast * 0.4
				, x: this.x
				, y: this.y - 10
			});

			this.args.gSpeed = this.xSpeedLast * 0.2

			this.viewport.spawn.add({object:shellTop});
			this.viewport.spawn.add({object:chao});

			this.broken = true;
		});

		this.bindTo('carriedBy', carrier => {
			if(this.cX) { this.cX(); this.cX = null; }
			if(this.cY) { this.cY(); this.cY = null; }
			if(carrier)
			{
				this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * 12);
				this.cY = carrier.args.bindTo('y', v => this.args.y = v + -12);

				carrier.carrying.add(this);

				this.args.float = -1;
			}
			else if(this.carriedBy)
			{
				const carrier = this.carriedBy;

				this.carriedBy = null;

				this.args.xSpeed = carrier.args.xSpeed;
				this.args.ySpeed = carrier.args.ySpeed;

				this.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
				this.args.ySpeed -= 4;

				this.args.xSpeed += carrier.xAxis * 2;

				carrier.carrying.delete(this);

				this.args.falling = true;
				this.args.float = 0;
			}
		});
	}

	lift(actor)
	{
		if(this.carriedBy === actor)
		{
			this.carriedBy = null;

			return;
		}

		this.carriedBy = actor;
	}

	get solid() { return false; }
}
