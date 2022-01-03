import { Tag } from 'curvature/base/Tag';
import { Vehicle } from './Vehicle';

export class EggShuttle extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-vehicle actor-egg-shuttle';

		this.args.accel     = 0.15;
		this.args.decel     = 0.8;

		this.args.gSpeedMax = 15;
		this.args.xSpeedMax = 45;
		this.args.ySpeedMax = 45;

		this.args.jumpForce = 3;
		this.args.gravity   = 0.6;

		this.args.width  = 96;
		// this.args.height = 308;
		this.args.height = 260;

		this.args.yMargin = 42;

		this.args.falling = true;
		this.args.flying = true;
		this.args.float = -1;

		this.args.seatHeight = 270;
		this.args.seatAngle = Math.PI / 2;
	}

	update()
	{
		if(this.sprite && !this.windshield)
		{
			this.windshield = new Tag('<div class = "shuttle-windshield">');
			this.boost = new Tag('<div class = "shuttle-boost">');

			this.sprite.appendChild(this.windshield.node);
			this.sprite.appendChild(this.boost.node);
		}

		if(this.occupant)
		{
			this.args.type = 'actor-item actor-vehicle actor-egg-shuttle actor-egg-shuttle-occupied';
			this.args.float = 1;
		}
		else
		{
			this.args.type = 'actor-item actor-vehicle actor-egg-shuttle';
			this.args.float = 0;
		}

		this.args.gSpeed = 0;
		this.args.facing = 'right';

		super.update();

	}

	processInputDirect(){};

	hold_0()
	{
		// this.args.ySpeed -= 0.6;
		// this.args.ySpeed -= 0.7;
		this.args.ySpeed -= 3;

		this.args.x += this.viewport.args.frameId % 2 ? -1 : 1;

		if(this.args.ySpeed < -20)
		{
			this.args.ySpeed = -20;
		}
	}

	get solid() { return !this.occupant; }
}
