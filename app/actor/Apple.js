import { PointActor } from './PointActor';

import { Sfx } from '../audio/Sfx';

export class Apple extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 11;
		this.args.height = 11;
		this.args.type   = 'actor-item actor-apple';
		this.args.float  = -1;
		this.collected   = false;
	}

	onRendered(event)
	{
		// const zoneState = this.viewport.getZoneState();
		// if(zoneState.apples.includes(this.args.id))
		// {
		// 	this.args.type = 'actor-item actor-apple actor-apple-collected';
		// 	this.collected = true;
		// }

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
			// other.args.apples.push(this);
			// zoneState.apples.push(this.args.id);
			this.args.type = 'actor-item actor-apple actor-apple-gone';
		}
		else
		{
			this.args.type = 'actor-item actor-apple actor-apple-gone actor-apple-collected';
		}

		this.gone = true;

		viewport.onFrameOut(20, () => {
			viewport.actors.remove(this);
		});

		viewport.currentSave.save();

		if(this.viewport.args.audio)
		{
			Sfx.play('apple_COLLECTED');
		}
	}
}
