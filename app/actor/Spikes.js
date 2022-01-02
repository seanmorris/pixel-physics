import { PointActor } from './PointActor';

export class Spikes extends PointActor
{
	static fromDef(objDef)
	{

		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;
		obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);

		return obj;
	}

	constructor(args, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-spikes';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;

		this.args.pointing = this.args.pointing || 0;

		this.hazard = true;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-pointing'] = 'pointing';
	}

	collideA(other, type)
	{
		if(this.args.falling && !this.args.float)
		{
			other.damage(false);
			return;
		}

		if(type === this.args.pointing)
		{
			if(this.args.pointing === 3)
			{
				const speed = other.args.xSpeed || (other.args.gSpeed * (other.args.mode === 2 ? -1:1));

				if(speed <= 0)
				{
					other.damage(this);
				}
			}
			else if(this.args.pointing === 1)
			{
				const speed = other.args.xSpeed || (other.args.gSpeed * (other.args.mode === 2 ? -1:1));

				if(speed >= 0)
				{
					other.damage(this);
				}
			}
			else if(this.args.pointing === 2)
			{
				const speed = other.args.ySpeed || (other.args.gSpeed * (other.args.mode === 1 ? -1:1));

				if(speed <= 0)
				{
					other.damage(this);
				}
			}
			else if(this.args.pointing === 0)
			{
				const speed = other.args.ySpeed || (other.args.gSpeed * (other.args.mode === 3 ? -1:1));

				if(speed >= 0)
				{
					other.damage(this);
				}
			}
		}

		return true;
	}

	get solid() {return true;}
}
