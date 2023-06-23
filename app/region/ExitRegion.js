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
		if(!this.viewport)
		{
			return;
		}

		if(this.args.signpost)
		{
			const signpost = this.viewport.actorsById[ this.args.signpost ];

			if(signpost.args.activeTime < 540)
			{
				other.args.bossMode = true;

				return;
			}
		}

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

		if(viewport.levelFinished)
		{
			return;
		}

		viewport.onFrameOut(30, () => {

			if(viewport.levelFinished)
			{
				return;
			}

			viewport.actors.remove(this);

			viewport.finishLevel();

			if(viewport.replay)
			{
				viewport.quit(2);
			}
			else if(this.args.nextStage)
			{
				const tally = viewport.clearAct(`${other.args.name} GOT THROUGH\n${viewport.args.actName}`, false);

				tally.addEventListener('done', event => viewport.quit(2, () => viewport.loadMap({mapUrl:'/map/'+this.args.nextStage})));
			}
			else
			{
				const tally = viewport.clearAct(`${other.args.name} GOT THROUGH\n${viewport.args.actName}`, false);;

				tally.addEventListener('done', event => viewport.quit());
				// viewport.playCards();
			}

		});
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
