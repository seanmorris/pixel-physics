import { Region } from "./Region";

export class SwitchRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-switch';
	}

	onAttach(event)
	{
		event && event.preventDefault();

		return false;
	}

	updateActor(actor)
	{
		if(!actor.controllable || !this.args.target)
		{
			return;
		}

		const target = this.viewport.actorsById[ this.args.target ];

		if(!target || !target.activate)
		{
			return;
		}

		this.viewport.onFrameOut(
			this.args.delay || 1
			, ()=>target.activate(actor, this)
		);
	}
}
