import { Region } from "./Region";

export class ExitRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region exit';
	}

	updateActor(other)
	{
		if(!other.controllable)
		{
			return;
		}

		const viewport = this.viewport;

		viewport.args.fade = true;

		viewport.onFrameOut(30, () => {
			viewport.actors.remove(this);
			viewport.quit();
		});
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
