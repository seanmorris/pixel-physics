import { Sfx } from '../audio/Sfx';
import { PointActor } from './PointActor';

export class DropTarget extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 48;
		this.args.height = this.args.height || 12;
		this.args.type   = 'actor-item actor-drop-target';
		this.args.float  = -1;
		this.args.z = 0;
		this.args.hits = 0;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--hits'] = 'hits';
	}

	collideA(other)
	{
		if(other.args.static || other.isRegion || this.ignores.has(other) || other.noClip)
		{
			return;
		}

		if(other.args.float || other.args.ySpeed <= 0)
		{
			return;
		}

		this.ignores.set(other, 8);

		other.args.ySpeed = -10;
		this.args.hits++;

		Sfx.play('PAD_BOUNCE');

		if(this.args.hits > 2)
		{
			this.viewport.actors.remove(this);
		}
	}

	get solid() { return false; }
}
false
