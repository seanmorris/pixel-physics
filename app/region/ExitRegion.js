import { Region } from "./Region";

export class ExitRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region exit';
		this.args.hidden = true;
	}

	updateActor(other)
	{
		if(this.args.signpost)
		{
			const signpost = this.viewport.actorsById[ this.args.signpost ];

			if(signpost.args.activeTime < 540)
			{
				other.args.bossMode = true;

				return;
			}
		}

		if(other.occupant)
		{
			other = other.occupant;
		}

		if(!other.controllable)
		{
			return;
		}

		const viewport = this.viewport;

		viewport.args.fade = true;

		viewport.clearCheckpoints();

		viewport.onFrameOut(30, () => {

			viewport.actors.remove(this);

			if(this.args.nextStage)
			{
				viewport.quit(2);
				viewport.loadMap({mapUrl:'/map/'+this.args.nextStage});
			}
			else
			{
				viewport.quit();
				// viewport.playCards();
			}

		});
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
