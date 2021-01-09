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

		if(!this.restingOn)
		{
			// this.debindYs && this.debindYs();
			// this.debindXs && this.debindXs();
			// this.debindGs && this.debindGs();
			// this.debindX  && this.debindX();
			this.debindY  && this.debindY();
		}
	}

	collideA(other)
	{
		super.collideA(other);

		if(
			this.args.collType !== 'collision-bottom'
			&& (!this.args.falling || this.args.float === -1)
			&& (Math.abs(other.args.xSpeed) > 3 || other.args.ySpeed > 1)
			&& other.y < this.y
			&& this.viewport
			&& !this.gone
		){
			this.gone = true;

			if(this.args.falling && Math.abs(other.args.ySpeed) > 10)
			{
				other.args.xSpeed *= -1;
				other.args.ySpeed *= -10;
			}

			other.args.ySpeed *= -1;

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
			(this.args.collType === 'collision-left' || this.args.collType === 'collision-right')
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

			return false;
		}

		return true;
	}

	collideB(other)
	{
		super.collideB(other);

		if(this.restingOn)
		{
			return true;
		}

		if(other.solid && this.args.collType === 'collision-bottom' && other.y > this.y)
		{
			// this.debindYs && this.debindYs();
			// this.debindXs && this.debindXs();
			// this.debindGs && this.debindGs();
			this.debindX  && this.debindX();
			this.debindY  && this.debindY();

			this.restingOn = other;

			// this.debindYs = other.args.bindTo('ySpeed', v => this.args.gSpeed = v);
			// this.debindXs = other.args.bindTo('xSpeed', v => this.args.gSpeed = v);
			// this.debindGs = other.args.bindTo('gSpeed', v => this.args.gSpeed = v);
			// this.debindX  = other.args.bindTo('x', v => this.args.x = v);
			this.debindY  = other.args.bindTo('y', v => this.args.y = v - this.args.height);

			this.onRemove(()=>{
				// this.debindYs && this.debindYs();
				// this.debindXs && this.debindXs();
				// this.debindGs && this.debindGs();
				// this.debindX  && this.debindX();
				this.debindY  && this.debindY();
			});
		}

		return true;
	}

	get canStick() { return false; }
	get solid() { return true; }
}

