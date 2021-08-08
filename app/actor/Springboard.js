import { PointActor } from './PointActor';

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

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/spring-activated.wav');
			this.sample.currentTime = 0;
			this.sample.volume = 0.05 + (Math.random() * 0.1);
		}
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

			if(this.viewport && this.viewport.args.audio && this.sample)
			{
				this.sample.volume = 0.05 + power * 0.3;
				this.sample.currentTime = 0;
				this.sample.play();

				console.log('A', power);
			}
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

			if(this.viewport && this.viewport.args.audio && this.sample)
			{
				this.sample.volume = 0.05 + power * 0.1;
				this.sample.play();

				console.log('B', power);
			}
		}

		if(other.args.ySpeed < 0)
		{
			this.args.animation = 'idle';
		}
	}
}
