import { PointActor } from './PointActor';
import { Mixin } from 'curvature/base/Mixin';
import { Pushable } from '../mixin/Pushable';

export class Orb extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-orb';

		this.args.width   = 48;
		this.args.height  = 48;
		this.args.rolled  = 0;

		// this.args.decel = 0;

		this.args.bindTo('x', (v,k,t,d,p) => this.args.rolled += Number(v - p || 0));

		this.args.gravity = 1.35;
	}

	onAttached(event)
	{
		this.autoStyle.get(this.box)['--rolled'] = 'rolled';
	}

	update()
	{
		if(!this.viewport || !this.viewport.controlActor)
		{
			return;
		}

		const other = this.viewport.controlActor;

		const speedMag  = Math.max(Math.abs(other.args.gSpeed) || Math.abs(this.args.gSpeed), 1);
		const speedSign = Math.sign(this.args.gSpeed || other.args.gSpeed);

		const xSpace = this.x - other.x;

		if(!this.args.falling)
		{
			if(speedSign
				&& !this.args.mode
				&& !other.args.mode
				&& !this.args.groundAngle
				&& !other.args.groundAngle
			){
				if(xSpace < -64)
				{
					this.args.gSpeed = other.args.gSpeed * 0.9;
				}

				if(xSpace < -128)
				{
					this.args.gSpeed = other.args.gSpeed;
				}

				if(xSpace < -176)
				{
					this.args.x -= xSpace + 176;
					this.args.gSpeed = other.args.gSpeed;
				}
			}
		}

		super.update();
	}

	collideA(other)
	{
		other.controllable && other.loseRings();
		other.controllable && other.die();
	}

	get solid() { return false; }
}