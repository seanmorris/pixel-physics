import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';
import { Mixin } from 'curvature/base/Mixin';
import { Sfx } from '../audio/Sfx';
// import { Sfx } from '../audio/Sfx';

import { SkateBoard } from './SkateBoard';

export class Chopper extends Mixin.from(PointActor)
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-chopper';

		this.args.width   = 160;
		this.args.height  = 96;
		this.args.gravity = 0.325;
		this.args.float   = -1;

		this.args.direction = 1;

		this.exploded = false;
		this.explosions = new Set;

		this.contains = new Set;

		this.args.xSpeed = 8;
		this.args.ySpeed = 6;

		this.args.color = Math.trunc(8 * Math.random());

		this.playingSound = false;
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--color'] = 'color';
	}

	update()
	{
		if(this.viewport.controlActor)
		{
			this.contains.add(this.viewport.controlActor);
		}

		if(this.viewport.controlActor)
		{
			const actor = this.viewport.controlActor;

			// this.args.xSpeed += 0.1 * actor.xAxis;
			// this.args.ySpeed += 0.1 * actor.yAxis;
		}

		if(this.args.ySpeed > -4)
		{
			this.args.ySpeed -= 0.025;
		}

		for(const explosion of this.explosions)
			{
				explosion.style({
					'--x': this.args.x + explosion.x * this.args.direction
					, '--y': this.args.y
				});
			}


		if(!this.exploded)
		{

			if(!this.playingSound && this.viewport.args.audio, this.viewport.args.frameId - this.playingSound > 10)
			{
				this.playingSound = this.viewport.args.frameId;
				Sfx.play('COPTER_SPIN', {});
			}

			for(const actor of this.contains)
			{
				actor.args.float = -1;
				actor.args.x = this.args.x;// + 24 * this.args.direction;
				actor.args.y = this.args.y;
				actor.args.hidden = true;

				actor.args.xSpeed = this.args.xSpeed;
				actor.args.ySpeed = this.args.ySpeed;
			}
		}
		else
		{
			Sfx.stop('COPTER_SPIN', false);

			this.args.float = 0;

			super.update();

			return;
		}

		super.update();

		if(this.viewport && this.age && this.age % 300 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			explosion.style({
				'--x': this.args.x + 18 * this.args.direction
				, '--y': this.args.y - 16
			});

			Sfx.play('OBJECT_DESTROYED');

			const viewport = this.viewport;

			this.viewport.onFrameOut(200, () => {
				viewport.actors.remove(this);
			});

			this.viewport.onFrameOut(10, () => {
				this.noClip = true;
				// viewport.actors.remove(this)
				for(const actor of this.contains)
				{
					this.args.xSpeed = 4;
					this.args.ySpeed = 1;
					actor.args.ySpeed = -10;
					actor.args.xSpeed = 0;
					actor.args.hidden = false;
					actor.args.float  = 0;
				}
			});

			this.args.animation = 'exploded';

			explosion.x = +18;

			this.explosions.add(explosion);

			this.exploded = true;

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => viewport.particles.remove(explosion));

			const board = new SkateBoard({
				x:this.args.x
				, y: this.args.y
				, ySpeed: -10
				, xSpeed: 4 * Math.sign(this.args.xSpeed)
				, groundAngle: Math.PI / 4
			});

			this.viewport.controlActor.args.standingOn = board;

			this.viewport.spawn.add({object:board});
		}

		if(this.viewport && this.age && this.age % 290 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 36 * this.args.direction
				, '--y': this.args.y - 32
			});

			explosion.x = 36;

			Sfx.play('OBJECT_DESTROYED');

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		}

		if(this.viewport && this.age && this.age % 295 === 0)
		{
			const explosionTag = document.createElement('div');
			explosionTag.classList.add('particle-huge-explosion');
			const explosion = new Tag(explosionTag);

			this.explosions.add(explosion);

			explosion.style({
				'--x': this.args.x + 0 * this.args.direction
				, '--y': this.args.y - 24
			});

			explosion.x = 0;

			Sfx.play('OBJECT_DESTROYED');

			this.viewport.particles.add(explosion);
			this.viewport.onFrameOut(30, () => viewport.particles.remove(explosion));
		}

		this.args.falling = true;
	}
}
