import { CharacterString } from '../ui/CharacterString';
import { PointActor } from './PointActor';

export class WindStone extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 8;
		this.args.height = 24;
		this.args.type   = 'actor-item actor-wind-stone';

		this.args.inPlace = false;

		this.label = new CharacterString({value: '❷'});

		this.args.charStrings = [this.label];

		this.args.bindTo('inPlace', v => {
			if(!v)
			{
				this.args.charStrings[0] = this.label;
				return;
			}

			this.args.charStrings.splice(0);
		});
		this.bindTo('carriedBy', carrier => {
			if(this.cX) { this.cX(); this.cX = null; }
			if(this.cY) { this.cY(); this.cY = null; }
			if(carrier)
			{
				this.cX = carrier.args.bindTo('x', v => this.args.x = v + carrier.args.direction * 8);
				this.cY = carrier.args.bindTo('y', v => this.args.y = v + -16);

				carrier.carrying.add(this);

				this.args.float = -1;

				this.args.charStrings.splice(0);
			}
			else if(this.carriedBy)
			{
				const carrier = this.carriedBy;

				this.carriedBy = null;

				this.args.xSpeed = carrier.args.xSpeed;
				this.args.ySpeed = carrier.args.ySpeed;

				this.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
				this.args.ySpeed -= 4;

				carrier.carrying.delete(this);

				this.args.falling = true;
				this.args.float = 0;

				if(!this.args.inPlace)
				{
					this.args.charStrings[0] = this.label;
				}

			}
		});
	}

	lift(actor)
	{
		if(this.args.inPlace)
		{
			return;
		}

		if(this.carriedBy === actor)
		{
			this.carriedBy = null;
			return;
		}

		this.carriedBy = actor;
	}

	update()
	{
		super.update();

		if(this.args.inPlace)
		{
			this.args.x += Math.sign(this.args.standingOn.args.x - this.args.x);;
		}
	}

	get solid() { return false; }
}
