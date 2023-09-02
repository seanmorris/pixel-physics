import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';

export class CrossCannon extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.width  = 48;
		this.args.height = 40;
		this.args.type   = 'actor-item actor-cross-cannon';
		this.args.float  = -1;
		this.args.power  = this.args.power || 20;

		this.holding = new Map;
		this.args.spinTime = 0;
		this.args.minHold = 9;

		this.args.grabbing = null;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoAttr.get(this.box)['data-firing'] = 'firing';
		this.autoAttr.get(this.box)['data-aiming'] = 'aiming';
		this.autoAttr.get(this.box)['data-grabbing'] = 'grabbing';

		if(!this.barrelUp)
		{
			this.barrelUp = new Tag(`<div class = "barrel barrel-up">`);
			this.box.appendChild(this.barrelUp.node);
		}

		if(!this.barrelDown)
		{
			this.barrelDown = new Tag(`<div class = "barrel barrel-down">`);
			this.box.appendChild(this.barrelDown.node);
		}

		if(!this.barrelLeft)
		{
			this.barrelLeft = new Tag(`<div class = "barrel barrel-left">`);
			this.box.appendChild(this.barrelLeft.node);
		}

		if(!this.barrelRight)
		{
			this.barrelRight = new Tag(`<div class = "barrel barrel-right">`);
			this.box.appendChild(this.barrelRight.node);
		}
	}

	collideA(other, type)
	{
		if(!other.controllable)
		{
			return;
		}

		if(other.isVehicle)
		{
			other = other.occupant;
		}

		if(this.holding.has(other))
		{
			return false;
		}

		const x = other.args.x;
		const y = other.args.y;

		if(!other.args.falling)
		{
			other.args.falling = true;
			other.args.float = 1;
			other.args.y -= 1;
		}

		if(other.args.standingOn)
		{
			other.args.standingOn = null;
			other.args.xSpeed = 0;
			other.args.ySpeed = 0;
		}

		Sfx.play('SS_BWIP');

		if(type === -1 || type % 2 === 0)
		{
			const xDiff = Math.abs(other.args.x - this.args.x);

			this.holding.set(other, this.viewport.args.frameId);

			other.args.xSpeed = 0;
			other.args.ySpeed = 0;
			other.args.float  = -1;
			other.args.ignore = -1;

			return false;
		}

		return true;
	}

	dropDelay(other)
	{
		let waitFor = false;

		if(this.args.waitFor)
		{
			waitFor = this.viewport.actorsById[this.args.waitFor];
		}

		if(!waitFor)
		{
			return new Promise(accept => this.viewport.onFrameOut(240, () => accept()));
		}

		return waitFor.dropDelay(other);
	}

	update()
	{
		super.update();

		if(!this.holding.size)
		{
			this.args.spinTime = 0;
		}

		for(const [other, caughtAt] of this.holding)
		{
			const toX = this.args.x + -4;
			const toY = -6 + this.args.y;
			const stepX = (toX + -other.args.x) / 6;
			const stepY = (toY + -other.args.y) / 6;
			const holdTime = this.viewport.args.frameId - caughtAt;

			other.args.animation = 'jumping';

			if(Math.abs(other.args.y - toY) < stepY)
			{
				other.args.y = toY;
			}
			else
			{
				other.args.y += stepY;
			}

			if(Math.abs(other.args.x - toX) < stepX)
			{
				other.args.x = toX;
			}
			else
			{
				other.args.x += stepX;
			}

			other.args.groundAngle += -other.args.groundAngle * 0.05;

			if(holdTime < 5)
			{
				this.args.grabbing = 'grabbing';
			}
			else if(holdTime < 10)
			{
				this.args.grabbing = 'grabbed';
			}
			else
			{
				this.args.grabbing = null;
			}

			if(holdTime > 100)
			{
				// other.args.float  = 0;
				// other.args.ignore = 1;
				// this.ignores.set(other, 16);
				// this.holding.delete(other);
				// return;
			}

			other.canJump = true;
			other.args.jumping = false;

			if(other.willJump && this.args.spinTime < this.args.minHold)
			{
				this.args.spinTime = 0;
				this.args.aiming = '';
				return;
			}
			else if(other.willJump && this.args.aiming && this.args.spinTime >= this.args.minHold)
			{
				this.args.firing = 'firing';

				this.viewport.onFrameOut(6, () => {
					this.args.firing = 'fired';
				});

				this.viewport.onFrameOut(16, () => {
					this.args.firing = '';
				});

				this.viewport.onFrameOut(24, () => {
					this.args.aiming = '';
				});

				this.viewport.onFrameOut(6, () => {
					if(!this.args.aiming)
					{
						return;
					}

					Sfx.play('SPRING_SHOT');
					this.holding.delete(other);
					other.args.jumping = true;
					this.ignores.set(other, 2);
					other.args.ignore = 1;
					other.args.float  = 0;

					if(other.yAxis > 0)
					{
						other.args.ySpeed = this.args.power;
					}
					else if(other.yAxis < 0)
					{
						other.args.ySpeed = -this.args.power;
					}
					else if(other.xAxis > 0)
					{
						other.args.xSpeed = this.args.power;
						other.args.ySpeed = 0;
						other.args.float = 8;
					}
					else if(other.xAxis < 0)
					{
						other.args.xSpeed = -this.args.power;
						other.args.ySpeed = 0;
						other.args.float = 8;
					}
				});
			}

			if(this.args.spinTime > 5)
			{
				other.args.cameraMode ='cross-cannon-quick';
			}
			else
			{
				other.args.cameraMode ='cross-cannon';
			}

			if(other.yAxis > 0)
			{
				this.args.aiming = 'down';
			}
			else if(other.yAxis < 0)
			{
				this.args.aiming = 'up';
			}
			else if(other.xAxis > 0)
			{
				this.args.aiming = 'right';
			}
			else if(other.xAxis < 0)
			{
				this.args.aiming = 'left';
			}

			if(!other.yAxis && !other.xAxis)
			{
				this.args.spinTime = 0;
				this.args.aiming   = '';
			}
			else if(this.args.aiming)
			{
				if(this.args.spinTime === 0)
				{
					Sfx.play('QUICK_SLIDE');
				}

				this.args.spinTime++;
			}

			if(this.args.spinTime === this.args.minHold && this.args.aiming)
			{
				Sfx.play('PAD_BOUNCE');
			}

			// if(this.viewport.args.frameId % (60 * 3) === 0)
			// {
			// 	this.args.aiming = '';
			// }
		}
	}

	wakeUp()
	{
		this.args.aiming = '';
	}

	// get solid() { return !this.holding; }
}
