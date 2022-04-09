import { Region } from "./Region";

export class LoadingRegion extends Region
{
	constructor(...args)
	{
		super(...args);

		this.args.hidden = true;

		this.loading = this.loaded = false;
	}

	updateActor(other)
	{
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

		tileMap.resize(width + 9, height);

		viewport.appendMap(this.args.map, xAppend, yAppend);

		this.loaded = true;
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
