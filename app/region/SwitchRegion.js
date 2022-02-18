import { Region } from "./Region";
import { Rocket } from "../actor/Rocket";

export class SwitchRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region region-switch';

		this.activated = false;
	}

	onAttach(event)
	{
		event && event.preventDefault();

		return false;
	}

	activate(actor)
	{
		if(this.args.latch && this.activated)
		{
			return;
		}

		const target = this.viewport.actorsById[ this.args.target ];

		if(!target)
		{
			return;
		}

		if(this.args.latch)
		{
			this.activated = true;
		}

		target.activate(actor, this);

	}

	updateActor(actor)
	{
		if(this.args.rocket)
		{
			if(actor instanceof Rocket)
			{
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

			return;
		}

		if(actor.isVehicle && actor.occupant)
		{
			actor = actor.occupant;
		}

		if(!(actor.controllable) || !this.args.target)
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
			, ()=>this.activate(actor)
		);
	}
}
