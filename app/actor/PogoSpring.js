import { Vehicle } from './Vehicle';

import { Tag } from 'curvature/base/Tag';

export class PogoSpring extends Vehicle
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-pogo-spring';

		this.args.width  = 32;
		this.args.height = 32;

		this.removeTimer = null;

		this.args.gSpeedMax = 20;
		this.args.decel     = 0.45;
		this.args.accel     = 0.45;
		this.args.gravity   = 1;

		this.args.seatHeight = 32;

		this.args.skidTraction = 0.05;
		this.args.jumpForce = 8;

		this.dustCount = 0;

		this.args.particleScale = 2;

		this.args.started = false;
	}

	onAttached()
	{
		// this.box = this.findTag('div');
		// this.sprite = this.findTag('div.sprite');

		// this.frontWheel = new Tag('<div class = "rail-car-wheel rail-car-wheel-front">');
		// this.backWheel = new Tag('<div class = "rail-car-wheel rail-car-wheel-back">');

		// this.frontFrag = new Tag('<div class = "rail-car-frag rail-car-frag-front">');
		// this.backFrag = new Tag('<div class = "rail-car-frag rail-car-frag-back">');

		// this.sprite.appendChild(this.frontWheel.node);
		// this.sprite.appendChild(this.backWheel.node);

		// this.sprite.appendChild(this.frontFrag.node);
		// this.sprite.appendChild(this.backFrag.node);
	}

	update()
	{

	}

	get solid() { return !this.occupant; }
}
