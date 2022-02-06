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
		this.args.xSpeedMax = 150;
		this.args.ySpeedMax = 50;

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

		this.args.thrustAngle = -Math.PI / 2;

		this.args.bindTo('boosting', v => {
			if(!this.boost) { return };

			this.boost.setAttribute('data-active', !!v);
		});
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

		if(this.args.falling)
		{
			this.args.cameraMode = 'aerial';
			this.args.cameraBias = Math.max(-0.125, (-this.args.ySpeed / this.args.ySpeedMax) + -0.25);

			this.args.thrustAngle += 0.01 * this.xAxis;

			this.args.groundAngle = -(this.args.thrustAngle + Math.PI / 2);
		}
		else
		{
			this.args.cameraMode = 'normal';
			this.args.cameraBias = 0;
			this.args.boosting = false;

			this.args.thrustAngle = -Math.PI / 2;
		}

	}


	processInputDirect(){};

	command_0(button)
	{}

	release_0(button)
	{
		this.args.boosting = false;
	}

	hold_0(button)
	{
		this.args.x += this.viewport.args.frameId % 2 ? -1 : 1;

		if(!this.args.falling && button.time < 60)
		{
			return;
		}

		this.args.falling = true;

		const impulse = this.args.gravity * (1 + (0.002 * Math.min(-60 + button.time, 150)));

		this.args.xSpeed += impulse * Math.cos(this.args.thrustAngle);
		this.args.ySpeed += impulse * Math.sin(this.args.thrustAngle);

		this.args.boosting = true;

	}

	get solid() { return !this.occupant; }
}
