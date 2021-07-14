import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class PowerupGlow extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-powerup-glow';

		this.args.width  = 64;
		this.args.height = 64;
	}

	onAttached()
	{
		this.autoAttr.get(this.box)['data-closed'] = 'closed';

		this.icon = new Tag('<div class = "powerup-icon">');
		this.halo = new Tag('<div class = "powerup-halo">');

		this.tags.sprite.appendChild(this.icon.node);

		this.box.appendChild(this.halo.node);
	}

	collideA(other)
	{

		super.collideA(other);

		if(!other.controllable)
		{
			return;
		}

		this.onTimeout(125, () => this.args.closed = 'closed');
		this.onTimeout(4500, () => this.args.closed = '');
	}

	get canStick() { return false; }
	get solid() { return false; }
	get isEffect() { return true; }
}
