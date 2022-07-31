import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';

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

		this.args.beat        = this.args.beat || 90;
		this.args.retractible = this.args.retractible ?? false;
		this.args.retracted   = false;

		this.hazard = true;

		this.age = 0;
	}

	updateStart()
	{
		if(this.args.retractible)
		{
			this.args.wasRetracted = this.args.retracted;

			this.args.retracted = !!(Math.floor(this.age / this.args.beat) % 2);

			if(!this.args.retracted && this.args.wasRetracted)
			{
				Sfx.play('SPIKES_OUT');

				const actors = this.viewport.actorsAtPoint(this.x, this.y, this.width, this.height);

				for(const actor of actors)
				{
					if(actor === this)
					{
						continue;
					}

					switch(this.args.pointing)
					{
						case 0:
							actor.args.y = this.args.y + -this.args.height + -4;
							break;

						case 1:
							actor.args.x = this.args.x + -(this.args.width/2) + -(actor.args.width/2) + -4;
							actor.damage(this);
							break;

						case 2:
							actor.args.y = this.args.y +  this.args.height/2;
							break;

						case 3:
							actor.args.x = this.args.y +  this.args.width/2 + actor.args.width/2 + 4;
							actor.damage(this);
							break;
					}

				}
			}
			if(this.args.retracted && !this.args.wasRetracted)
			{
				Sfx.play('SPIKES_IN');
			}
		}

		super.updateStart();

		this.age++;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-pointing']  = 'pointing';
		this.autoAttr.get(this.box)['data-retracted'] = 'retracted';
	}

	startle(){}
	damage(){}

	collideA(other, type)
	{
		if(this.args.retracted)
		{
			return false;
		}

		if(other.isRegion)
		{
			return;
		}

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
					other.args.x = this.args.x + (this.args.width/2)  + (other.args.width/2) + 4;
					other.damage(this);
				}
			}
			else if(this.args.pointing === 1)
			{
				const speed = other.args.xSpeed || (other.args.gSpeed * (other.args.mode === 2 ? -1:1));

				if(speed >= 0)
				{
					other.args.x = this.args.x + -(this.args.width/2)  + -(other.args.width/2) + -4;
					other.damage(this);
				}
			}
			else if(this.args.pointing === 2)
			{
				const speed = other.args.ySpeed || (other.args.gSpeed * (other.args.mode === 1 ? -1:1));

				if(speed <= 0)
				{
					other.args.y = this.args.y + other.args.height;
					other.damage(this);
				}
			}
			else if(this.args.pointing === 0)
			{
				const speed = other.args.ySpeed || (other.args.gSpeed * (other.args.mode === 3 ? -1:1));

				if(speed >= 0)
				{
					other.args.y = this.args.y + -this.args.height;
					other.damage(this);
				}
			}
		}

		return true;
	}

	get solid() {return !this.args.wasRetracted;}
}
