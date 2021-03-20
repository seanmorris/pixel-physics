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

		this.args.gSpeedMax = 16;
		this.args.jumpForce = 16;
		this.args.gravity   = 1;

		this.args.takeoffPlayed = false;

		this.args.width  = 32;
		this.args.height = 63;

		this.args.bindTo('falling', v => {
			if(!v)
			{
				this.landSound();
			}
		})
	}

	onAttached()
	{
		this.box = this.findTag('div');
		this.sprite = this.findTag('div.sprite');
	}

	update()
	{
		if(!this.sprite)
		{
			return;
		}

		const falling = this.args.falling;

		this.args.accel = 0.3;

		const direction = this.public.direction;
		const gSpeed    = this.public.gSpeed;
		const speed     = Math.abs(gSpeed);
		const maxSpeed  = 100;
		const minRun    = 100 * 0.1;
		const minRun2   = 0.75 * this.public.gSpeedMax;

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

		if(!this.public.rolling && !falling)
		{
			if(Math.sign(this.public.gSpeed) !== direction && Math.abs(this.public.gSpeed - direction) > 5)
			{
				this.scrapeSound && this.scrapeSound.play();

				this.box.setAttribute('data-animation', 'skidding');
			}
			else if(speed >= minRun2)
			{
				this.scrapeSound && this.scrapeSound.pause();

				this.box.setAttribute('data-animation', 'running2');

				this.thrusterSound && this.thrusterSound.play();

				if(!this.public.takeoffPlayed)
				{
					this.args.takeoffPlayed = true;
					this.takeoffSound && this.takeoffSound.play();
				}

				this.args.accel = 0.75;

				if(speed > maxSpeed * 0.75)
				{
					this.args.accel = 0.01;
				}
			}
			else if(speed >= minRun)
			{
				this.scrapeSound && this.scrapeSound.play();
				this.box.setAttribute('data-animation', 'running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.scrapeSound && this.scrapeSound.play();
				this.box.setAttribute('data-animation', 'walking');
			}
			else if(this.args.crouching || (this.standingOn && this.standingOn.isVehicle))
			{
				this.box.setAttribute('data-animation', 'crouching');
			}
			else
			{
				this.scrapeSound && this.scrapeSound.pause();
				this.box.setAttribute('data-animation', 'standing');
			}

			if(speed < minRun2)
			{
				this.closeThruster()
			}
		}
		else if(this.public.rolling)
		{
			if(this.box.getAttribute('data-animation') !== 'rolling' && this.box.getAttribute('data-animation') !== 'jumping')
			{
				this.box.setAttribute('data-animation', 'curling');

				this.onTimeout(128, ()=>{
					if(this.public.rolling)
					{
						this.box.setAttribute('data-animation', 'rolling');

						this.closeThruster();
					}
				});
			}
			else
			{
				this.box.setAttribute('data-animation', 'rolling');

				this.closeThruster();
			}
		}
		else
		{
			this.scrapeSound && this.scrapeSound.pause();

			if(this.box.getAttribute('data-animation') !== 'rolling' && this.box.getAttribute('data-animation') !== 'jumping')
			{
				this.box.setAttribute('data-animation', 'curling');

				this.onTimeout(128, ()=>{
					if(this.public.falling)
					{
						this.box.setAttribute('data-animation', 'jumping');

						this.closeThruster();
					}
				});
			}
			else
			{
				this.box.setAttribute('data-animation', 'jumping');

				this.closeThruster();
			}
		}

		super.update();
	}

	closeThruster()
	{
		if(this.args.takeoffPlayed)
		{
			this.landSound();
		}

		this.args.takeoffPlayed = false;
		this.thrusterSound && this.thrusterSound.pause();
	}

	landSound()
	{
		this.thrusterCloseSound && this.thrusterCloseSound.play();
	}

	sleep()
	{
		this.thrusterSound && this.thrusterSound.pause();
		this.scrapeSound && this.scrapeSound.pause();
	}

	get solid() { return false; }
	get isEffect() { return false; }
	get canRoll() { return true; }
	get controllable() { return true; }
}
