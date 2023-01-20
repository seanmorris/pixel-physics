import { Tag } from 'curvature/base/Tag';
import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';
import { AsteroidMedium } from './AsteroidMedium';
import { AsteroidBase }   from './AsteroidBase';

export class AsteroidLarge extends AsteroidBase
{
	constructor(...args)
	{
		super(...args);

		this.args.type    = `${this.args.type} actor-asteroid-large`;
		this.args.gravity = 0.45;
		this.args.width   = 64;
		this.args.height  = 80;
	}

	update()
	{
		super.update();

		if(!this.viewport || this.viewport.args.frameId % 3)
		{
			return;
		}

		const dustParticle = new Tag(document.createElement('div'));

		dustParticle.classList.add('particle-dust');

		dustParticle.style({
			'--x': this.args.x
			, '--y': this.args.y + -this.args.height -0.75
			, 'z-index': 0
			, opacity: Math.random() * 0.25 + 0.5
		});

		viewport.particles.add(dustParticle);

		viewport.onFrameOut(30, () => {
			viewport.particles.remove(dustParticle);
		});
	}

	collideA(other)
	{
		if(!other.controllable || this.args.broken || other.args.mercy)
		{
			return;
		}

		if(other.args.y < this.args.y + -this.args.height * 0.75)
		{
			return;
		}

		this.args.xSpeed = 0;

		other.damage(this, 'rock');
		Sfx.play('ROCK_BREAK_1');
		this.break();
	}

	break()
	{
		const xSpeed = this.xSpeedLast || this.gSpeedLast || 0;
		const ySpeed = this.ySpeedLast || 0;

		const pieces = [
			  new AsteroidMedium({falling:true, x:this.args.x - 20, y:this.args.y - 20, xSpeed, ySpeed:-ySpeed * 0.25 + -1.5, xSpeed:xSpeed * 0.333 - 0.5})
			, new AsteroidMedium({falling:true, x:this.args.x + 20, y:this.args.y - 20, xSpeed, ySpeed:-ySpeed * 0.25 + -1.5, xSpeed:xSpeed * 0.333 + 0.5})
			, new AsteroidMedium({falling:true, x:this.args.x +  0, y:this.args.y -  4, xSpeed, ySpeed:-ySpeed * 0.25 + -1.0, xSpeed:xSpeed * 0.333 + 0.0})
			, new AsteroidMedium({falling:true, x:this.args.x +  0, y:this.args.y - 40, xSpeed, ySpeed:-ySpeed * 0.25 + -2.0, xSpeed:xSpeed * 0.333 + 0.0})
		];

		pieces.forEach(object => viewport.spawn.add({object}));

		viewport.onFrameOut(1, () => viewport.actors.remove(this));

		this.args.broken = true;

		Sfx.play('ROCK_BREAK_1');
	}
}
