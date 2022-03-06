import { Block } from './Block';
import { Orb } from './Orb';

import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';

export class BreakableBlock extends Block
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.type = 'actor-item actor-breakable-block';

		if(this.args.collapse)
		{
			this.args.type = 'actor-item actor-breakable-block collapsible-block';
		}

		this.args.static = true;
		this.args.strength = 0 || Number(this.args.strength);

		this.fragmentsX = new Tag('<div class = "fragmentsX">');
		this.fragmentsY = new Tag('<div class = "fragmentsY">');

		this.fragmentTopLeft = new Tag('<div class = "fragment fragment-top-left">');
		this.fragmentTopRight = new Tag('<div class = "fragment fragment-top-right">');
		this.fragmentBottomLeft = new Tag('<div class = "fragment fragment-bottom-left">');
		this.fragmentBottomRight = new Tag('<div class = "fragment fragment-bottom-right">');

		this.fragmentsY.append(this.fragmentTopLeft.node);
		this.fragmentsY.append(this.fragmentTopRight.node);
		this.fragmentsY.append(this.fragmentBottomLeft.node);
		this.fragmentsY.append(this.fragmentBottomRight.node);

		this.fragmentsX.append(this.fragmentsY.node);

		this.broken = false;
	}

	onRendered()
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		this.box.append(this.fragmentsX.node);

		super.onRendered();
	}

	updateStart()
	{
		super.updateStart();

		if(this.switch)
		{
			if(this.switch.args.active && !this.broken)
			{
				this.break();
			}
		}
	}

	update()
	{
		super.update();
	}

	callCollideHandler(...args)
	{
		if(this.broken)
		{
			return false;
		}

		return super.callCollideHandler(...args);
	}

	collideA(other, type)
	{
		if(other instanceof Block && (other.args.float || this.args.float))
		{
			return false;
		}

		if(!(other instanceof Orb) && !other.isVehicle && !other.controllable && !other.args.rolling)
		{
			return !this.broken;
		}

		if(this.args.collapse)
		{
			if(!this.broken && other.y <= this.y - this.args.height)
			{
				this.fragmentsX.style({'--xSpeed': 0});

				if(!other.args.falling)
				{
					if(this.args.worm)
					{
						this.delayedBreak(5);
					}
					else
					{
						this.delayedBreak(25);
					}
				}

				return true;
			}

			if(!this.broken)
			{
				if(!other.args.falling || (other.args.ySpeed > 0 && other.y < this.y - this.args.height))
				{
					return true;
				}
			}

			return false;
		}

		if(this.args.strength === -1)
		{
			return true;
		}

		if(this.args.strength === 1 && other.args.name === 'knuckles')
		{
			if(other.args.falling || Math.abs(other.args.gSpeed) > 4)
			{
				this.broken || this.break(other);
				return false;
			}
		}

		if(this.args.strength === 1)
		{
			if(other.args.name !== 'knuckles' && !other.isVehicle)
			{
				return true;
			}
			else if(other.args.name !== 'knuckles' || other.args.falling || Math.abs(other.args.gSpeed) > 4)
			{
				this.broken || this.break(other);

				return false;
			}
		}

		if(this.args.strength === 2)
		{
			if(!other.isVehicle)
			{
				return true;
			}
			else
			{
				this.broken || this.break(other);

				return false;
			}
		}

		if(!(other.args.rolling && other.args.mode) && !other.isVehicle && !other.args.spinning)
		{
			if((other.args.falling && !(other.dashed || other.args.jumping))
				|| (!other.args.falling && type === 0)
			){
				return !this.broken;
			}
		}

		if(!(other instanceof Orb)
			&& !other.falling
			&& !other.isVehicle
			&& !other.args.gSpeed
			&& !other.args.xSpeed
			&& !other.args.ySpeed
		){
			return !this.broken;
		}

		if((other instanceof Orb)
			|| other.args.spinning
			|| other.args.dashed
			|| other.punching
		){
			const top = this.y - this.args.height;

			if(this.args.bounceBack && other.args.jumping && other.y < top)
			{
				other.args.ySpeed *= -bounceBack;
				other.args.y = top;
			}

			this.break(other);

			return false;
		}

		return !this.broken;
	}

	sleep()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.dontRestore)
		{
			return;
		}

		if(this.args.collapse)
		{
			this.args.static = true;
			this.args.falling = false;
			this.args.float = -1;
			this.args.ySpeed = 0;
			this.noClip = false;

			this.args.ySpeed = 0;

			this.box.classList.remove('broken');
			this.box.classList.remove('breaking');

			this.broken = false;
		}

		if(this.args.worm)
		{
			this.args.x += this.args.worm;
		}
		else
		{
			this.args.x = this.def.get('x');
		}

		this.args.y = this.def.get('y') + 1;

		this.box.classList.remove('broken');
		// this.args.y = this.def.get('y') + 1;

		this.args.active = 0;

		this.broken = false;

		this.viewport.setColCell(this);
	}

	delayedBreak(delay = 30, other = null)
	{
		if(other && other.args.falling)
		{
			return;
		}

		this.viewport.onFrameOut(delay, () => this.break(other));
	}

	break(other)
	{
		if(this.box)
		{
			this.box.classList.add('breaking');
			this.box.classList.add('broken');
		}

		if(!this.broken)
		{
			Sfx.play('BLOCK_DESTROYED');
		}

		this.viewport.onFrameOut(4, () => {
			this.box && this.box.classList.remove('breaking');
		});

		if(!this.args.collapse && other && other.args.mode % 2 === 0)
		{
			const x = other.args.xSpeed || other.args.gSpeed;

			if(other.isVehicle)
			{
				this.fragmentsX.style({'--xSpeed': Math.round(x * 1.1 )});
			}
			else
			{
				this.fragmentsX.style({'--xSpeed': Math.round(x)});
			}
		}

		if(!this.refresher)
		{
			this.refresher = true;
		}

		this.args.active = 1;

		if(this.args.collapse && !this.broken)
		{
			const left  = this.viewport.actorsAtPoint(this.x - this.args.width, this.y);
			const right = this.viewport.actorsAtPoint(this.x + this.args.width, this.y);

			if(Array.isArray(left) && !Math.sign(this.args.worm))
			{
				for(const actor of left)
				{
					if(!(actor instanceof BreakableBlock))
					{
						continue;
					}

					if(!actor.args.collapse)
					{
						continue;
					}

					if(actor.broken)
					{
						continue;
					}

					actor.delayedBreak(8)
				}
			}

			if(Array.isArray(right) && !Math.sign(this.args.worm))
			{
				for(const actor of right)
				{
					if(!(actor instanceof BreakableBlock))
					{
						continue;
					}

					if(!actor.args.collapse)
					{
						continue;
					}

					if(actor.broken)
					{
						continue;
					}

					actor.delayedBreak(8)
				}
			}
		}

		if(this.viewport.settings.rumble && !this.broken && other && other.controller && other.controller.rumble)
		{
			other.controller && other.controller.rumble && other.controller.rumble({
				duration: 140,
				strongMagnitude: 1.0,
				weakMagnitude: 1.0
			});

			this.onTimeout(140, () => {
				other.controller.rumble({
					duration: 100,
					strongMagnitude: 0.0,
					weakMagnitude: 0.25
				});
			});
		}

		this.broken = true;
	}

	damage(other, type = 'normal')
	{
		this.break(other);
	}

	get solid() { return !this.broken; }
}

