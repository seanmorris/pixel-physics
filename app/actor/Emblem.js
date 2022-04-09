import { PointActor } from './PointActor';

import { Sfx } from '../audio/Sfx';

export class Emblem extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 32;
		this.args.height = 32;
		this.args.type   = 'actor-item actor-emblem';
		this.args.float  = -1;
		this.collected   = false;
	}

	onRendered(event)
	{
		const zoneState = this.viewport.getZoneState();

		if(zoneState.emblems.includes(this.args.id))
		{
			this.args.type = 'actor-item actor-emblem actor-emblem-collected';

			this.collected = true;
		}

		return super.onRendered(event);
	}

	collideA(other)
	{
		if(!other.controllable || this.gone)
		{
			return;
		}

		const viewport = this.viewport;

		const zoneState = viewport.getZoneState();

		if(!this.collected)
		{
			other.args.emblems.push(this);
			zoneState.emblems.push(this.args.id);
			this.args.type = 'actor-item actor-emblem actor-emblem-gone';
		}
		else
		{
			this.args.type = 'actor-item actor-emblem actor-emblem-gone actor-emblem-collected';
		}

		this.gone = true;

		viewport.onFrameOut(20, () => {
			viewport.actors.remove(this);
		});

		viewport.currentSave.save();

		if(this.viewport.args.audio)
		{
			Sfx.play('EMBLEM_COLLECTED');
		}
	}
}
