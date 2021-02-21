import { PointActor } from './PointActor';

import { Explosion } from '../actor/Explosion';
import { Projectile } from '../actor/Projectile';
import { BrokenMonitor } from '../actor/BrokenMonitor';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor';

		this.args.width  = 28;
		this.args.height = 32;

		this.args.gone = false;
	}

	update()
	{
		super.update();

		if(!this.viewport)
		{
			return;
		}

		if(this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/object-destroyed.wav');
			this.sample.volume = 0.6 + (Math.random() * -0.3);
		}
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(
			type !== 2
			&& (!this.public.falling || this.public.float === -1)
			&& (
				(other.public.ySpeed > 0 && other.y < this.y)
				|| other.public.rolling
			)
			&& this.viewport
			&& !this.public.gone
		){
			this.args.gone = true;

			other.args.ySpeed *= -1;
			other.args.falling = true;

			if(this.args.falling && Math.abs(other.args.ySpeed) > 0)
			{
				other.args.xSpeed *= -1;
			}

			this.pop(other);
		}
		else if(
			(type === 1 || type === 3)
			&& ((Math.abs(other.args.xSpeed) > 15
				|| (Math.abs(other.args.gSpeed) > 15))
				|| (other instanceof Projectile)
			)
			&& this.viewport
			&& !this.public.gone
		){
			this.pop(other);
		}
	}

	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		const corpse = new BrokenMonitor({x:this.x, y:this.y});

		viewport.actors.remove( this );

		viewport.actors.add(corpse);
		viewport.actors.add(new Explosion({x:this.x, y:this.y+8}));

		setTimeout(()=>{
			viewport.actors.remove(corpse);
			corpse.remove();
		}, 5000);

		if(other.args.owner)
		{
			other.args.owner.args.rings += 10;
		}
		else if(other.occupant)
		{
			other.occupant.args.rings += 10;
		}
		else
		{
			other.args.rings += 10;
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}
	}

	get canStick() { return false; }
	get solid() { return false; }
}

