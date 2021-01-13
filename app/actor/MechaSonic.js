import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class MechaSonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-mecha-sonic';

		this.args.accel = 0.3;
		this.args.decel = 0.3;

		this.args.gSpeedMax = 40;
		this.args.jumpForce = 15;
		this.args.gravity   = 0.7;

		this.args.takeoffPlayed = false;

		this.args.width  = 48;
		this.args.height = 63;
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
	}

	update()
	{
		const falling = this.args.falling;

		if(!this.box)
		{
			super.update();
			return;
		}

		this.args.accel = 0.3;

		const direction = this.args.direction;
		const gSpeed    = this.args.gSpeed;
		const speed     = Math.abs(gSpeed);
		const maxSpeed  = 100;
		const minRun    = 100 * 0.1;
		const minRun2   = 100 * 0.35;

		if(!this.flame)
		{
			this.sparks = new Tag('<div class = "mecha-sonic-sparks">');
			this.flame = new Tag('<div class = "mecha-sonic-flame">');

			this.sprite.appendChild(this.sparks.node);
			this.sprite.appendChild(this.flame.node);
		}

		if(this.viewport.args.audio && !this.thrusterSound)
		{
			this.takeoffSound = new Audio('/Sonic/mecha-sonic-takeoff.wav');
			this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');
			this.scrapeSound = new Audio('/Sonic/mecha-sonic-scrape.wav');
			this.thrusterCloseSound = new Audio('/Sonic/mecha-sonic-thruster-close.wav');

			this.thrusterCloseSound.volume  = 0.25;
			this.takeoffSound.volume = 0.5;
			this.scrapeSound.volume = 0.1;

			this.thrusterSound.loop = true;
			this.scrapeSound.loop = true;
		}

		if(this.thrusterSound)
		{
			this.thrusterSound.volume = 0.15 + (Math.random() * -0.05);

			if(this.thrusterSound.currentTime > 1.5)
			{
				this.thrusterSound.currentTime = 0.5;
			}

			if(this.scrapeSound.currentTime > 1.5)
			{
				this.scrapeSound.currentTime = 0.5;
			}
		}



		if(!falling)
		{
			if(gSpeed === 0)
			{
				this.scrapeSound.pause();
				this.box.setAttribute('data-animation', 'standing');
			}
			else if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed >= minRun2)
			{
				this.scrapeSound.pause();
				this.box.setAttribute('data-animation', 'running2');

				this.thrusterSound.play();

				if(!this.args.takeoffPlayed)
				{
					this.args.takeoffPlayed = true;
					this.takeoffSound.play();
				}

				this.args.accel = 0.75;

				if(speed > maxSpeed * 0.75)
				{
					this.args.accel = 0.01;
				}
			}
			else if(speed >= minRun)
			{
				this.scrapeSound.play();
				this.box.setAttribute('data-animation', 'running');
			}
			else
			{
				this.scrapeSound.play();
				this.box.setAttribute('data-animation', 'walking');
			}

			if(speed < minRun2)
			{
				if(this.args.takeoffPlayed)
				{
					this.thrusterCloseSound.play();
				}

				this.args.takeoffPlayed = false;
				this.thrusterSound.pause();
			}
		}
		else
		{
			this.scrapeSound.pause();
			if(this.box.getAttribute('data-animation') !== 'jumping')
			{
				this.box.setAttribute('data-animation', 'curling');

				this.onTimeout(128, ()=>{
					if(this.args.falling)
					{
						this.box.setAttribute('data-animation', 'jumping');
					}
				});
			}
		}

		super.update();
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get controllable() { return true; }
}
