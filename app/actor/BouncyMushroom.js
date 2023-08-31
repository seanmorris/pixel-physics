// import { PointActor } from './PointActor';
// import { Sfx } from '../audio/Sfx';
// import { Bgm } from '../audio/Bgm';
// import { Tag } from 'curvature/base/Tag';
import { Block } from './Block';

export class BouncyMushroom extends Block
{
	constructor(...args)
	{
		super(...args);

		this.args.width    = 64;
		this.args.height   = 32;
		this.args.platform = true;
		this.args.float    = -1;
		this.args.type     = 'actor-item actor-bouncy-mushroom';
		this.args.stemLength = this.args.stemLength ?? 64;

		this.args.pressed = 0;
	}

	onRendered()
	{
		super.onRendered();

		this.autoStyle.get(this.box)['--stem-length'] = 'stemLength';
	}

	update()
	{
		super.update();

		if(!this.def.get('stemLength'))
		{
			const stemLengthL = this.castRayQuick(1024, Math.PI/2, [-16,0], true) || 32;
			const stemLengthR = this.castRayQuick(1024, Math.PI/2, [+16,0], true) || 32;

			this.args.stemLength = Math.min(stemLengthL, stemLengthR);
		}

		this.args.active = this.args.pressed > 0;

		if(this.args.pressed > 0)
		{
			this.args.pressed--;
		}
	}

	collideA(other, type)
	{
		if(type === 0 && other.args.ySpeed >= 0)
		{
			other.args.ySpeed = (other.args.flying && other.flyTime > 2) ? -2 : -8;
			super.collideA(other, type);
			this.args.pressed = 6;
			return;
		}

		return super.collideA(other, type);
	}

	// get solid() {return this.groundTime > 15};
}
