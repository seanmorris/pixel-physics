import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

export class DrillCar extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-drill-car';

		this.args.width  = 93;
		this.args.height = 48;

		this.removeTimer = null;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.drill = new Tag('<div class = "drill-car-tire drill-car-drill">');

		this.seat = new Tag('<div class = "drill-car-seat">');
		this.windsheild = new Tag('<div class = "drill-car-windsheild">');

		this.frontWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-front-a">');
		this.frontWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-front-b">');

		this.backWheelA = new Tag('<div class = "drill-car-tire drill-car-tire-back-a">');
		this.backWheelB = new Tag('<div class = "drill-car-tire drill-car-tire-back-b">');

		this.sprite.appendChild(this.drill.node);

		this.sprite.appendChild(this.seat.node);
		this.sprite.appendChild(this.windsheild.node);

		this.sprite.appendChild(this.frontWheelA.node);
		this.sprite.appendChild(this.frontWheelB.node);

		this.sprite.appendChild(this.backWheelA.node);
		this.sprite.appendChild(this.backWheelB.node);
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		if(!falling)
		{
			const direction = this.args.direction;
			const gSpeed    = this.args.gSpeed;
			const speed     = Math.abs(gSpeed);
			const maxSpeed  = this.args.gSpeedMax;

			if(this.args.moving && gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{
				this.box.setAttribute('data-animation', 'standing');
			}
		}
		else
		{
			this.box.setAttribute('data-animation', 'jumping');
		}

		super.update();
	}

	get solid() { return true; }
	get controllable() { return true; }
}
