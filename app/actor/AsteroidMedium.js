import { PointActor } from './PointActor';
import { Block } from './Block';

import { Sfx } from '../audio/Sfx';
import { AsteroidSmall } from './AsteroidSmall';
import { AsteroidBase }  from './AsteroidBase';

export class AsteroidMedium extends AsteroidBase
{
	constructor(...args)
	{
		super(...args);

		this.args.type    = `${this.args.type} actor-asteroid-medium`;
		this.args.gravity = 0.50;
		this.args.width   = 48;
		this.args.height  = 48;
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

		// this.args.xSpeed = 0;

		other.damage(this, 'rock');
		Sfx.play('ROCK_BREAK_2');
	}

	break()
	{
		const xSpeed = this.xSpeedLast || this.gSpeedLast || 0;
		const ySpeed = this.ySpeedLast || 0;

		const pieces = [
			  new AsteroidSmall({falling:true, x:this.args.x +  0, y:this.args.y - 24, ySpeed: ySpeed * -0.5 - 1, xSpeed:xSpeed + 0.00})
			, new AsteroidSmall({falling:true, x:this.args.x +  0, y:this.args.y +  0, ySpeed: ySpeed * -0.5 - 1, xSpeed:xSpeed + 0.00})
			, new AsteroidSmall({falling:true, x:this.args.x - 14, y:this.args.y - 12, ySpeed: ySpeed * -0.5 - 1, xSpeed:xSpeed - 0.15})
			, new AsteroidSmall({falling:true, x:this.args.x + 14, y:this.args.y - 12, ySpeed: ySpeed * -0.5 - 1, xSpeed:xSpeed + 0.15})
		];

		pieces.forEach(object => viewport.spawn.add({object}));

		viewport.onFrameOut(1, () => viewport.actors.remove(this));

		this.args.broken = true;

		Sfx.play('ROCK_BREAK_2');
	}
}
