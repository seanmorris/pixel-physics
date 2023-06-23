import { PointActor } from './PointActor';

export class TrickRamp extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-trick-ramp';

		this.args.width   = this.args.width  || 64;
		this.args.height  = this.args.height || 64;
		this.args.float   = -1;
		this.args.static  = 1;
		this.args.power   = this.args.power || 24;
		// this.args.hidden  = true;
	}

	collideA(other)
	{
		if(other.args.x < this.args.x)
		{
			return;
		}

		if(Math.abs(other.args.gSpeed) < 8 && other.willJump)
		{
			return;
		}

		if(Math.abs(other.args.gSpeed) < 14 && other.args.rolling && !other.willJump)
		{
			return;
		}

		if(other.willJump || other.args.rolling)
		{
			if(!other.args.falling)
			{
				const reward = {label:'OFF THE RAMP', points:100, multiplier: 1, color: 'orange', special: true};
				other.args.popChain.push(reward);
				other.args.popCombo += 1;
			}

			const dir = Math.sign(other.args.gSpeed || other.gSpeedLast);;

			other.args.trickRamp = true;
			other.args.ignore = 5;
			other.args.xSpeed = this.args.power * dir
			other.args.ySpeed = -this.args.power * 0.65;
			other.args.float  = 18;
			other.args.y -= 5;
			other.args.rolling = true;
			other.args.falling = true;
			other.willJump = false;
			other.dashed = true;
		}
	}
}
