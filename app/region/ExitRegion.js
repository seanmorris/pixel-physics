import { Region } from "./Region";

export class ExitRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'region exit';
		this.args.hidden = true;
		this.triggered = false;
	}

	updateActor(other)
	{
		if(!this.viewport)
		{
			return;
		}

		// if(this.args.signpost)
		// {
		// 	const signpost = this.viewport.actorsById[ this.args.signpost ];

		// 	if(signpost.args.activeTime < 30)
		// 	{
		// 		other.args.bossMode = true;

		// 		return;
		// 	}
		// }

		if(this.others.boss && this.others.boss.args.hitPoints > 0)
		{
			return;
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

		// viewport.args.fade = true;

		viewport.clearCheckpoints();

		if(this.triggered)
		{
			return;
		}

		viewport.onFrameOut(30, () => {

			if(this.triggered)
			{
				return;
			}

			// viewport.actors.remove(this);

			this.triggered = true;

			// viewport.finishLevel();

			const tally = this.others.signpost && this.others.signpost.tally;

			if(viewport.replay)
			{
				viewport.quit(2);
			}
			else if(this.args.nextStage)
			{
				const t = tally || viewport.clearAct(`${other.args.name} GOT THROUGH\n${viewport.args.actName}`, false);

				t.addEventListener('done', event => viewport.quit(2, () => viewport.loadMap({mapUrl:'/map/'+this.args.nextStage})));
			}
			else
			{
				const t = tally || viewport.clearAct(`${other.args.name} GOT THROUGH\n${viewport.args.actName}`, false);

				t.addEventListener('done', event => viewport.quit(2));
			}

		});
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
