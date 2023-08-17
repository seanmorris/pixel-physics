import { Tag } from 'curvature/base/Tag';
import { Flickie } from './Flickie';

import { Mixin } from 'curvature/base/Mixin';
import { PointActor } from './PointActor';

import { Patrol } from '../behavior/Patrol';
import { CanPop } from '../mixin/CanPop';

import { Projectile } from '../actor/Projectile';

export class Skorp extends Mixin.from(PointActor, CanPop)
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new Patrol);

		this.args.type      = 'actor-item actor-skorp';

		this.args.animation = 'standing';

		this.args.accel     = 0.1;
		this.args.decel     = 0.5;

		this.args.gSpeedMax = 5;
		this.args.jumpForce = 5;
		this.args.gravity   = 0.5;

		this.args.width     = 24;
		this.args.height    = 32;
		this.args.color     = this.args.color ?? 'green';

		this.willStick = false;
		this.stayStuck = false;

		this.args.patrolPause   = this.args.patrolPause   ?? 20;
		this.args.patrolBeat    = this.args.patrolBeat    ?? 120;
		this.args.patrolSpeed   = this.args.patrolSpeed   ?? 1;

		this.args.segmentCount = 5;
		this.args.segmentAngle = Math.PI / 2;

		this.aggroCount = 0;
		this.coolDown = 0;
	}

	onRendered()
	{
		super.onRendered();

		this.autoAttr.get(this.box)['data-color'] = 'color';

		this.autoStyle.get(this.box)['--segments'] = 'segmentCount';
		this.autoStyle.get(this.box)['--segmentAngle'] = 'segmentAngle';

		this.autoStyle.get(this.box)['--aim-direction'] = 'aimDirection';
		this.autoStyle.get(this.box)['--tail-angle'] = 'tailAngle';

		if(!this.tail)
		{
			this.tail = new Tag(`<div class = "tail">`);

			const segments = [
				new Tag(`<div   class = "segment" style = "--index:0">`)
				, new Tag(`<div class = "segment" style = "--index:1">`)
				, new Tag(`<div class = "segment" style = "--index:2">`)
				, new Tag(`<div class = "segment" style = "--index:3">`)
				, new Tag(`<div class = "segment" style = "--index:4">`)
				, new Tag(`<div class = "end gun" style = "--index:5">`)
			];

			let lastSegment;

			for(const segment of segments)
			{
				if(!lastSegment)
				{
					this.tail.append(segment.node);
				}
				else
				{
					lastSegment.append(segment.node);
				}

				lastSegment = segment;
			}

			this.box.appendChild(this.tail.node);
		}
	}

	update()
	{
		const direction = this.args.direction;
		const telegraph = this.args.shotTelegraph;
		const beat      = this.args.patrolBeat;

		if(this.box)
		{
			if(this.args.moving && this.args.gSpeed)
			{
				this.box.setAttribute('data-animation', 'walking');
			}
			else
			{

				this.box.setAttribute('data-animation', 'standing');
			}
		}

		const maxDist = 256;

		const leftDist  = this.castRayQuick(maxDist, Math.PI, [0,-16], false) || maxDist;
		const rightDist = this.castRayQuick(maxDist, 0,       [0,-16], false) || maxDist;

		const leftActors  = this.viewport.actorsAtLine(this.x, this.y - 16, this.x - leftDist,  this.y + -16);
		const rightActors = this.viewport.actorsAtLine(this.x, this.y - 16, this.x + rightDist, this.y + -16);

		const leftFiltered   = [...leftActors.keys()].filter(a => a.controllable);
		const rightFiltered = [...rightActors.keys()].filter(a => a.controllable);

		if(leftFiltered.length)
		{
			this.args.aimDirection = -1;
		}
		else if(rightFiltered.length)
		{
			this.args.aimDirection = 1;
		}
		else
		{
			this.args.aimDirection = 0;
		}

		if(this.args.aimDirection)
		{
			if(this.args.aimDirection !== this.args.direction)
			{
				this.args.tailAngle = -20 * this.args.aimDirection;
			}
			else
			{
				this.args.tailAngle = -20 * this.args.aimDirection;
			}

			this.coolDown = 30;

			this.aggroCount++;
		}
		else
		{
			if(this.coolDown <= 0)
			{
				this.args.tailAngle = -8 * this.args.direction;
			}
			else
			{
				this.coolDown--;
			}

			this.aggroCount = 0;
		}

		if(this.aggroCount > 10)
		{
			if(this.args.aimDirection !== this.args.direction)
			{
				const ball = new Projectile({
					x: this.args.x + 60 * this.args.aimDirection
					, y: this.args.y - 28
					, xSpeed: 4 * this.args.aimDirection
					, ySpeed: 0.55
					, float: -1
					, owner: this
				});

				this.viewport.spawn.add({object:ball});

				this.aggroCount = 0;
			}
			else
			{
				const ball = new Projectile({
					x: this.args.x + 54 * this.args.aimDirection
					, y: this.args.y - 42
					, xSpeed: 4 * this.args.aimDirection
					, ySpeed: 0.55
					, float: -1
					, owner: this
				});

				this.viewport.spawn.add({object:ball});

				this.aggroCount = 0;
			}
		}

		super.update();

		this.args.direction = Math.sign(this.args.gSpeed) || this.args.direction;
	}

	effect(other)
	{
		super.effect(other);

		// this.viewport.spawn.add({object:new Flickie({
		// 	x: this.args.x,
		// 	y: this.args.y,
		// })});
	}

	get solid() { return false; }
	get isEffect() { return false; }
	// get controllable() { return true; }
}
