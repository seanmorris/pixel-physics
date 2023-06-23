import { Region } from "./Region";

export class LoadingRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.hidden = true;

		this.loading = this.loaded = false;

		this.args.xOffset = this.args.xOffset ?? 0;
	}

	updateActor(other)
	{
		if(this.others.signpost && (!this.others.signpost.args.active))
		{
			if(this.others.signpostAlt && (!this.others.signpostAlt.args.active))
			{
				return;
			}
		}

		if(!other.controllable)
		{
			return;
		}

		if(this.loaded || this.loading)
		{
			return;
		}

		if(!this.loading)
		{
			this.loading = true;
		}
	}

	updateEnd()
	{
		super.updateStart();

		if(this.loaded || !this.loading)
		{
			return;
		}

		const viewport = this.viewport;
		const tileMap  = viewport.tileMap;

		const width  = tileMap.mapData.width;
		const height = tileMap.mapData.height;

		const xAppend = this.args.x / 32 + this.args.xOffset;
		const yAppend = 0;

		// tileMap.resize(width + 9, height);

		if(this.others.signpost)
		{
			viewport.args.frozen = 30;
			viewport.appendMap(this.args.map, xAppend, yAppend);
			// this.others.signpost.waitFor =
		}

		// viewport.args.zonecard.replay({});

		this.loaded = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
