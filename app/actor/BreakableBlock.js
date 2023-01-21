import { Block } from './Block';
import { Orb } from './Orb';

import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';
import { Platformer } from '../behavior/Platformer';
import { ObjectPalette } from '../ObjectPalette';

export class BreakableBlock extends Block
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		// this.behaviors.clear();

		this.args.type = 'actor-item actor-breakable-block';

		if(this.args.collapse)
		{
			this.args.type = 'actor-item actor-breakable-block collapsible-block';
		}

		this.args.static = true;
		this.args.strength = 0 || Number(this.args.strength);

		this.fragmentsX = document.createElement('div');
		this.fragmentsY = document.createElement('div');

		this.fragmentsX.classList.add('fragmentsX')
		this.fragmentsY.classList.add('fragmentsY')

		this.fragmentTopLeft     = document.createElement('div');
		this.fragmentTopRight    = document.createElement('div');
		this.fragmentBottomLeft  = document.createElement('div');
		this.fragmentBottomRight = document.createElement('div');

		this.fragmentTopLeft.classList.add('fragment');
		this.fragmentTopLeft.classList.add('fragment-top-left');

		this.fragmentTopRight.classList.add('fragment');
		this.fragmentTopRight.classList.add('fragment-top-right');

		this.fragmentBottomLeft.classList.add('fragment');
		this.fragmentBottomLeft.classList.add('fragment-bottom-left');

		this.fragmentBottomRight.classList.add('fragment');
		this.fragmentBottomRight.classList.add('fragment-bottom-right');

		this.fragmentsY.append(this.fragmentTopLeft);
		this.fragmentsY.append(this.fragmentTopRight);
		this.fragmentsY.append(this.fragmentBottomLeft);
		this.fragmentsY.append(this.fragmentBottomRight);

		this.fragmentsX.append(this.fragmentsY);

		this.broken = false;
	}

	onRendered(event)
	{
		this.box    = this.findTag('div');
		this.sprite = this.findTag('div.sprite');

		super.onRendered(event);
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
		const regions = this.viewport.regionsAtPoint(this.args.x, this.args.y);

		for(const region of regions)
		{
			region.updateActor(this);
		}

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
		if(this.broken)
		{
			return false;
		}

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
				const up  = this.viewport.actorsAtPoint(this.x, this.y + -this.args.height + -1);

				if(Array.isArray(up))
				{
					for(const actor of up)
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

						return false;
					}
				}

				this.fragmentsX.style.setProperty('--xSpeed', 0);

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

		if(this.args.strength === -2)
		{
			if(other.args.falling || Math.abs(other.args.gSpeed) > 4)
			{
				this.broken || this.break(other);
				return false;
			}
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
			if(other.isVehicle || (other.args.standingOn && other.args.standingOn.isVehicle))
			{
				if(type ===  0)
				{
					this.viewport.onFrameOut(1, () => this.broken || this.break(other));
					return true;
				}

				this.broken || this.break(other);
				return false;
			}
			else
			{
				return true;
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
			&& !other.args.falling
		){
			return !this.broken;
		}

		if((other instanceof Orb)
			|| other.isVehicle
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
			this.noClip = false;

			this.args.ySpeed = 0;

			this.box.classList.remove('broken');
			this.box.classList.remove('breaking');
			this.box.classList.remove('will-break');

			this.fragmentsX.remove();

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

		if(this.broken)
		{
			this.box.classList.remove('broken');
			this.box.classList.remove('breaking');
			this.box.classList.remove('will-break');
			this.fragmentsX.remove();
		}

		// this.args.y = this.def.get('y') + 1;

		this.args.active = 0;

		this.broken = false;

		this.viewport.setColCell(this);
	}

	delayedBreak(delay = 30, other = null, silent = false)
	{
		if(this.delay || (other && other.args.falling))
		{
			return;
		}

		this.box.append(this.fragmentsX);

		this.delay = this.viewport.onFrameOut(delay, () => {
			this.break(other, silent)
			this.delay = false;
		});
	}

	break(other, silent = false)
	{
		const wasBroken = this.broken;

		if(!this.broken)
		{
			this.box.append(this.fragmentsX);

			this.broken = true;

			if(this.box)
			{
				const viewport = this.viewport;

				this.box.classList.add('will-break');
				this.box.classList.add('breaking');
				viewport.onFrameOut(1, () => {
					this.box.classList.add('broken');
				});
				// viewport.onFrameOut(1, () => {
				// });
				// viewport.onFrameOut(1, () => {
				// });
			}

			if(!silent)
			{
				this.viewport.onFrameOut(
					Math.floor(Math.random() * 3)
					, () => Sfx.play('BLOCK_DESTROYED')
				);
			}


			const o = (other && other.occupant) || other;

			if(o && o.controllable)
			{
				if(o.args.popChain.length)
				{
					const reward = {label: this.args.name, points:10, multiplier:1};

					o.args.popCombo += 1;
					o.args.popChain.push(reward);
				}

				const scoreNode = document.createElement('div');
				scoreNode.classList.add('particle-score');
				scoreNode.classList.add('score-10');
				const scoreTag = new Tag(scoreNode);

				scoreTag.style({'--x': this.args.x, '--y': this.args.y - this.args.height});

				this.viewport.particles.add(scoreTag);
				setTimeout(() => this.viewport.particles.remove(scoreTag), 768);

				o.args.score += 10;
			}

			this.args.contains && console.log(this.args.contains);

			if(this.args.contains && ObjectPalette[this.args.contains])
			{
				const object = new ObjectPalette[this.args.contains];

				object.args.x = this.args.x;
				object.args.y = this.args.y - this.args.height * 0.5;

				object.args.ySpeed = -6;

				this.viewport.spawn.add({object});
			}
		}

		this.viewport.onFrameOut(30, () => {
			this.box && this.box.classList.remove('breaking');
			this.fragmentsX.remove();
		});

		if(!this.args.collapse && other && other.args.mode % 2 === 0)
		{
			const speed = other.args.xSpeed || other.args.gSpeed;
			const dir = Math.sign(speed);
			const mag = Math.abs(speed);

			const x = Math.min(512, mag) * dir;

			if(other.isVehicle)
			{
				this.fragmentsX.style.setProperty('--xSpeed', Math.round(x * 1.1));
			}
			else if(other.controllable)
			{
				this.fragmentsX.style.setProperty('--xSpeed', Math.round(x));
			}
			else
			{
				this.fragmentsX.style.setProperty('--xSpeed', Math.round(x) * 2);
			}
		}

		if(!this.refresher)
		{
			this.refresher = true;
		}

		this.args.active = 1;

		if(this.args.collapse && !wasBroken)
		{
			const left  = this.viewport.actorsAtPoint(this.x - this.args.width, this.y);
			const right = this.viewport.actorsAtPoint(this.x + this.args.width, this.y);
			const down  = this.viewport.actorsAtPoint(this.x, this.y + 1);

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

					actor.delayedBreak(8, null, silent);
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

					actor.delayedBreak(8, null, silent);
				}
			}

			if(Array.isArray(down) && !Math.sign(this.args.worm))
			{
				for(const actor of down)
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

					actor.delayedBreak(8, null, true);
				}
			}
		}
		else if(!wasBroken)
		{
			const up = this.viewport.actorsAtPoint(this.x, this.y + -this.args.height);

			if(Array.isArray(up) && !Math.sign(this.args.worm))
			{
				for(const actor of up)
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

					actor.delayedBreak(8, null, silent)
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

	get solid() { return !this.broken && this.args.strength !== -2; }
}

