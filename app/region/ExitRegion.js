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

		viewport.clearCheckpoints(other.args.id);

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

				viewport.playCards();
			}
		});
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
