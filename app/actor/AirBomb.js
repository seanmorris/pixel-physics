import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';
import { Tag } from 'curvature/base/Tag';

export class AirBomb extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width   = 22;
		this.args.height  = 32;
		this.args.type    = 'actor-item actor-air-bomb';
		this.args.decel   = 0;

		this.explosions = new Set;
	}

	update()
	{

		if(!this.args.falling && !this.explosions.size)
		{
			this.explode();
		}

		super.update();

		for(const explosion of this.explosions)
		{
			explosion.style({
				'--x': this.args.x
				, '--y': this.args.y + -16
			});
		}
	}

	collideA(other)
	{
		if(!other.controllable)
		{
			return;
		}

		other.damage(this);
		this.explode();
		this.args.float = -1;
		this.args.xSpeed = 0;
		this.args.ySpeed = 0;
	}

	explode()
	{
		if(this.exploded)
		{
			return;
		}

		this.exploded = true;

		this.args.type = 'actor-item actor-air-bomb hide';

		const explosionTag = document.createElement('div');
		explosionTag.classList.add('particle-huge-explosion');
		const explosion = new Tag(explosionTag);

		this.explosions.add(explosion);

		const viewport = this.viewport;

		this.viewport.particles.add(explosion);
		this.viewport.onFrameOut(30, () => {
			viewport.particles.remove(explosion)
			viewport.actors.remove(this);
			this.explosions.delete(explosion);
		});

		Sfx.play('OBJECT_DESTROYED');
	}
}
