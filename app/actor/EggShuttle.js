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
		this.args.xSpeedMax = 15;
		this.args.ySpeedMax = 15;

		this.args.jumpForce = 3;
		this.args.gravity   = 0.6;

		this.args.width  = 96;
		this.args.height = 308;

		this.args.yMargin = 42;

		this.args.falling = true;
		this.args.flying = true;
		this.args.float = -1;

		this.args.seatHeight = this.args.height - 40;
		this.args.seatForward = -16;
		this.args.seatAngle = Math.PI / 2;

		this.args.thrustAngle = -Math.PI / 2;

		this.args.bindTo('boosting', v => {
			if(!this.boost) { return };

			this.boost.setAttribute('data-active', !!v);
		});

		this.args.crashAngle = 0;

		this.args.bindTo('falling', v => {
			if(Math.abs(this.args.groundAngle) < Math.PI / 4)
			{
				return;
			}

			this.args.crashAngle = this.args.groundAngle;
		});
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--crash-angle'] = 'crashAngle';
	}

	updateStart()
	{
		super.updateStart();

		if(this.args.falling)
		{
			this.args.groundAngle = -(this.args.thrustAngle + Math.PI / 2);
		}
	}

	updateEnd()
	{
		super.updateEnd();

		if(!this.args.falling)
		{
			this.args.groundAngle = 0;
		}

		if(this.args.crashAngle)
		{
			this.args.groundAngle = this.args.crashAngle;

			if(this.occupant)
			{
				const occupant = this.occupant;

				occupant.args.standingOn = false;
				occupant.args.falling    = true;
				occupant.args.xSpeed     = Math.sign(this.xSpeedLast) * 2;
				occupant.args.ySpeed     = -12;
				occupant.args.y         += -12;
			}
		}
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
			this.args.cameraMode = 'rocket';

			// const maxBias = 0.06125;
			// this.args.cameraBias = Math.max(-maxBias, Math.min(maxBias, (this.args.ySpeed / this.args.ySpeedMax) * -maxBias));
			// console.log(this.args.cameraBias);

			this.args.thrustAngle += 0.02 * this.xAxis;

			if(this.args.thrustAngle < -Math.PI * 7/8)
			{
				this.args.thrustAngle = -Math.PI * 7/8;
			}

			if(this.args.thrustAngle > -Math.PI * 1/8)
			{
				this.args.thrustAngle = -Math.PI * 1/8;
			}
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

		if(Math.abs(this.args.xSpeed) > this.args.xSpeedMax)
		{
			this.args.xSpeed = this.args.xSpeedMax * Math.sign(this.args.xSpeed);
		}

		if(Math.abs(this.args.ySpeed) > this.args.ySpeedMax)
		{
			this.args.ySpeed = this.args.ySpeedMax * Math.sign(this.args.ySpeed);
		}

		this.args.boosting = true;

	}

	collideA(other, type)
	{
		if(this.args.crashAngle)
		{
			return false;
		}

		super.collideA(other, type);
	}

	get solid() { return !this.args.crashAngle && !this.occupant; }
}
