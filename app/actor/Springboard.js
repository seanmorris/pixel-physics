import { PointActor } from './PointActor';
import { Sfx } from '../audio/Sfx';

export class Springboard extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-springboard';

		this.args.width  = 56;
		this.args.height = 16;

		this.args.animation = 'idle';
	}

	collideA(other, type)
	{
		if(!other.controllable || this.args.ignore)
		{
			return;
		}

		let power = Math.min(1, Math.max(0, 1 + (-this.x + -26 + other.x) / 56));

		if(power < 0.5)
		{
			power *= 0.5;
		}

		this.args.animation = 'depressed';

		if(other.args.jumping
			&& this.args.animation !== 'idle'
			&& other.args.ySpeed < 0
		){
			this.args.ignore = 6;

			this.args.animation = 'idle';

			const xSpeed = Math.max(other.args.gSpeed / 2, other.args.xSpeed);

			this.onNextFrame(()=>{
				other.args.xSpeed = xSpeed;
				other.args.ySpeed += -12 * power;
			});

			Sfx.play('SPRING_HIT');
		}

		if(-this.x + other.x <= -26)
		{
			this.args.animation = 'idle';
		}

		if((-this.x + other.x >= 26 || Math.abs(other.args.gSpeed) > 13) && other.args.mode === 0)
		{
			this.args.ignore = 6;

			const xSpeed = Math.max(other.args.gSpeed / 2, other.args.xSpeed);

			this.onNextFrame(()=>{
				other.args.falling = true;
				other.args.xSpeed = xSpeed;
				other.args.ySpeed = -8;
			});

			this.viewport.onFrameOut(5, () => this.args.animation = 'idle');

			Sfx.play('SPRING_HIT');
		}

		if(other.args.ySpeed < 0)
		{
			this.args.animation = 'idle';
		}
	}
}
