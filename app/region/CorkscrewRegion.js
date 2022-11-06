import { Region } from "./Region";

import { Tag } from 'curvature/base/Tag';

export class CorkscrewRegion extends Region
{
	static fromDef(objDef)
	{
		const width = objDef.width;
		const height = objDef.height;
		const x = objDef.x;
		const y = objDef.y;

		const obj = super.fromDef(objDef);

		obj.args.width  = width;
		obj.args.height = height;

		// obj.args.x = x - width  / 2;
		obj.args.y = y + height;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region corkscrew';
		this.args.hidden = true;
	}

	updateActor(other)
	{
		if(!other.canRoll || (other.args.falling && other.args.ySpeed < 0))
		{
			return;
		}

		if(Math.abs(other.args.xSpeed) < 1 || Math.abs(other.args.ySpeed) > 5)
		{
			if(other.args.animation === 'corkscrew')
			{
				other.args.animation = 'walking';
			}

			return;
		}

		other.args.groundAngle = 0;

		const xDist  = (other.x - this.x) / this.args.width;
		const shiftFactor = (1 + Math.cos(-Math.PI + xDist * Math.PI * 2))
		const yShift = shiftFactor * this.args.height * 0.5;

		other.args.y = this.y - yShift + -1;

		other.args.ySpeed = 0;
		other.args.xSpeed = Math.max(Math.abs(other.args.xSpeed) || (other.args.width)) * Math.sign(other.args.xSpeed);
		other.args.mode   = 0;
		other.args.ignore = -2;
		other.args.cameraMode = 'corkscrew';

		other.args.xSpeed += Math.sign(other.args.xSpeed) * (-1 + Math.abs(shiftFactor)) * 0.25;

		other.args.gSpeed = other.args.xSpeed;

		if(xDist > 1 || xDist < 0)
		{
			other.args.animation = 'walking';
			// other.args.falling = false;
			other.args.y = this.y - 1;
			other.args.corkscrew = 0;
		}
		else
		{
			other.args.animation = 'corkscrew';
			other.args.corkscrew = xDist;
		}
	}

	collideA(other)
	{
		return false;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
