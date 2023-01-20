import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';
import { ObjectPalette } from '../ObjectPalette';

export class Relief extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 24;
		this.args.height = 80;
		this.args.type   = 'actor-item actor-relief';
		this.noClip = true;
		this.args.float = -1;
		this.args.offset = this.args.offset ?? 45;
		this.args.animation = 'idle'

		this.args.shoots = this.args.shoots ?? 'spitsteam';

		this.launching = new Set;
	}

	update()
	{
		super.update();

		const frame = this.viewport.args.frameId + -this.args.offset;

		if(frame % 60)
		{
			return;
		}

		if(!this.shoots && ObjectPalette[this.args.shoots])
		{
			const type = ObjectPalette[this.args.shoots];
			const direction = this.args.direction ?? 1;

			this.shoots = new type({
				owner: this
				, direction
				, x: this.x
				, y: this.y + -24
				, z: this.z + 1
			});

			this.shoots.args.x += this.shoots.args.width * 0.5 * direction + this.args.width * 0.3 * direction;
			this.shoots.args.y += this.shoots.args.height * 0.5;

			this.viewport.spawn.add({object:this.shoots});
		}

		if(this.shoots.args.gone)
		{
			this.shoots = null;
		}
	}

	collideA(other)
	{
		return true;
	}

	get solid() { return true; };
}
