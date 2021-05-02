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
		this.icon = new Tag('<div class = "powerup-icon">');
		this.halo = new Tag('<div class = "powerup-halo">');

		this.tags.sprite.appendChild(this.halo.node);
		this.tags.sprite.appendChild(this.icon.node);
	}

	collideA(other)
	{

		super.collideA(other);

		if(!other.controllable)
		{
			return;
		}

		this.onTimeout(125, () => this.tags.sprite.classList.add('closed'));
		this.onTimeout(2500, () => this.tags.sprite.classList.remove('closed'));
	}

	get canStick() { return false; }
	get solid() { return false; }
	get isEffect() { return true; }
}
