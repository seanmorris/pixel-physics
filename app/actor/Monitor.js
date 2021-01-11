import { PointActor } from './PointActor';

import { Explosion } from '../actor/Explosion';
import { BrokenMonitor } from '../actor/BrokenMonitor';

export class Monitor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-monitor';

		this.args.width  = 28;
		this.args.height = 32;

		this.gone = false;
	}

	update()
	{
		super.update();

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
			&& (!this.args.falling || this.args.float === -1)
			&& other.args.ySpeed > 0
			&& other.y < this.y
			&& this.viewport
			&& !this.gone
		){
			this.gone = true;

			other.args.ySpeed *= -1;

			if(this.args.falling && Math.abs(other.args.ySpeed) > 1)
			{
				other.args.xSpeed *= -1;
			}

			const viewport = this.viewport;

			viewport.actors.add(new Explosion({x:this.x, y:this.y+8}));

			const corpse = new BrokenMonitor({x:this.x, y:this.y+1});

			this.onTimeout(60, () => {
				viewport.actors.remove( this );
				viewport.actors.add(corpse);
			});

			this.onRemove(()=>setTimeout(()=>{
				viewport.actors.remove(corpse);
				corpse.remove();
			}, 5000));

			if(other.args.owner)
			{
				other.args.owner.args.rings += 10;
			}
			else
			{
				other.args.rings += 10;
			}

			if(this.viewport.args.audio && this.sample)
			{
				this.sample.play();
			}

			return true;
		}

		if(
			(type === 1 || type === 3)
			&& (Math.abs(other.args.xSpeed) > 15 || (Math.abs(other.args.gSpeed) > 15))
			&& this.viewport
			&& !this.gone
		){
			const viewport = this.viewport;

			const corpse = new BrokenMonitor({x:this.x, y:this.y+1});

			viewport.actors.add(new Explosion({x:this.x, y:this.y+8}));

			viewport.actors.remove( this );
			viewport.actors.add(corpse);

			if(other.args.owner)
			{
				other.args.owner.args.rings += 10;
			}
			else
			{
				other.args.rings += 10;
			}

			if(viewport.args.audio && this.sample)
			{
				this.sample.play();
			}

			return true;
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
}

