import { PointActor } from './PointActor';
import { Vehicle } from './Vehicle';
import { Tag } from 'curvature/base/Tag';
import { Sfx } from '../audio/Sfx';
import { SkidDust } from '../behavior/SkidDust';

export class MechaSonic extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.behaviors.add(new SkidDust('particle-sparks'));

		this.args.type = 'actor-item actor-mecha-sonic';

		this.args.accel     = 0.1;
		this.args.decel     = 0.3;

		this.args.skidTraction = 2;

		this.args.gSpeedMax = 18;
		this.args.jumpForce = 11;
		this.args.gravity   = 0.5;

		this.args.takeoffPlayed = false;

		this.args.rollingHeight   = 28;
		this.args.normalHeight  = 44;

		this.args.width  = 18;
		this.args.height = this.args.normalHeight;

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

		this.args.accel = 0.1;

		const direction = this.args.direction;
		const gSpeed    = this.args.gSpeed;
		const speed     = Math.abs(gSpeed);
		const maxSpeed  = 100;
		const minRun    = 100 * 0.1;
		const minRun2   = 0.5 * this.args.gSpeedMax;

		if(!this.flame)
		{
			this.sparks = new Tag('<div class = "mecha-sonic-sparks">');
			this.flame = new Tag('<div class = "mecha-sonic-flame">');

			this.sprite.appendChild(this.sparks.node);
			this.sprite.appendChild(this.flame.node);
		}

		if(this.viewport.args.audio && !this.thrusterSound)
		{
			this.thrusterSound = new Audio('/Sonic/mecha-sonic-thruster.wav');
			this.scrapeSound = new Audio('/Sonic/mecha-sonic-scrape.wav');
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
			this.dashed = false;
		}

		if(!this.args.rolling && !falling)
		{
			if(this.yAxis > 0)
			{
				this.args.crouching = true;
			}
			else
			{
				this.args.crouching = false;
			}

			if(Math.sign(this.args.gSpeed) !== direction && Math.abs(this.args.gSpeed - direction) > 5)
			{
				this.scrapeSound && this.scrapeSound.play();

				this.args.animation = 'skidding';
			}
			else if(speed >= minRun2)
			{
				this.scrapeSound && this.scrapeSound.pause();

				this.args.animation = ('running2');

				this.thrusterSound && this.thrusterSound.play();

				if(!this.args.takeoffPlayed)
				{
					this.args.takeoffPlayed = true;
					Sfx.play('MECHASONIC_TAKEOFF');
				}

				this.args.accel = 0.75;

				if(speed > maxSpeed * 0.75)
				{
					this.args.accel = 0.03;
				}
			}
			else if(speed >= minRun)
			{
				this.scrapeSound && this.scrapeSound.play();
				this.args.animation = ('running');
			}
			else if(this.args.moving && gSpeed)
			{
				this.scrapeSound && this.scrapeSound.play();

				if(this.args.animation === 'curling'
					|| this.args.animation === 'jumping'
					|| this.args.animation === 'rolling'
				){
					this.args.animation = 'uncurling';

					this.onTimeout(128, ()=>{
						this.args.animation = 'walking';
					});
				}
				else if(this.args.animation === 'standing'
					|| this.args.animation === 'running'
					|| this.args.animation === 'running2'
				){
					this.args.animation = 'walking';
				}
			}
			else if(this.args.crouching || (this.standingOn && this.standingOn.isVehicle))
			{
				this.args.animation = 'crouching';
			}
			else
			{
				this.scrapeSound && this.scrapeSound.pause();

				if(this.args.animation === 'curling'
					|| this.args.animation === 'jumping'
					|| this.args.animation === 'rolling'
				){
					this.args.animation = 'uncurling';

					this.onTimeout(128, ()=>{
						this.args.animation = 'standing';
					});
				}
				else if(this.args.animation === 'walking'
					|| this.args.animation === 'running'
					|| this.args.animation === 'running2'
					|| this.args.animation === 'skidding'
					|| this.args.animation === 'crouching'
					|| this.args.animation === 'rolling'
				){
					this.args.animation = 'standing';
				}
			}

			if(speed < minRun2)
			{
				this.closeThruster();
			}
		}
		else if(this.args.rolling)
		{
			this.scrapeSound && this.scrapeSound.pause();

			if(this.args.animation !== 'curling'
				&& this.args.animation !== 'uncurling'
				&& this.args.animation !== 'rolling'
				&& this.args.animation !== 'jumping'
			){
				this.args.animation = 'crouching';

				this.onTimeout(200, ()=>{
					if(this.args.rolling)
					{
						this.args.animation = 'rolling';

						this.closeThruster();
					}
				});
			}
		}
		else
		{
			this.scrapeSound && this.scrapeSound.pause();

			if(this.dashed)
			{
				this.args.animation = 'running2';
			}
			else if(this.args.animation !== 'rolling'
				&& this.args.animation !== 'jumping'
				&& this.args.animation !== 'uncurling'
				&& this.args.animation !== 'curling'
				&& this.args.animation !== 'crouching'
			){
				this.args.animation = 'curling';

				this.onTimeout(200, ()=>{
					Sfx.play('MECHASONIC_SLAP');

					if(this.args.falling)
					{
						if(this.dashed)
						{
							this.args.animation = 'running2';
						}
						else if(this.args.jumping)
						{
							this.args.animation = 'jumping';
						}

						this.closeThruster();
					}
				});
			}
			else if(!this.args.jumping)
			{
				this.args.animation = 'crouching';
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
		Sfx.play('MECHASONIC_SLAP');
	}

	sleep()
	{
		this.thrusterSound && this.thrusterSound.pause();
		this.scrapeSound && this.scrapeSound.pause();
	}

	command_5()
	{
		if(this.args.falling)
		{
			this.airDash(1);
		}
	}

	command_4()
	{
		if(this.args.falling)
		{
			this.airDash(-1);
		}
	}

	airDash(direction)
	{
		if(this.dashed || (this.args.ignore && this.args.ignore !== -2))
		{
			return;
		}

		if(direction < 0)
		{
			this.args.direction = -1;
			this.args.facing    = 'left';
		}
		else
		{
			this.args.direction = 1;
			this.args.facing    = 'right';
		}

		let dashSpeed = direction * 7;

		this.args.float = 3;

		this.args.mode = 0;
		this.args.float = 2;

		this.args.rolling = false;
		this.args.height = this.args.normalHeight;

		if(this.args.xSpeed && Math.sign(this.args.xSpeed) !== Math.sign(direction))
		{
			dashSpeed = direction * 11;
			this.args.float  = 6;
			this.args.xSpeed = 0;
		}

		this.args.falling = true;

		const finalSpeed = this.args.xSpeed + dashSpeed;

		const space = this.scanForward(dashSpeed, 0.5);

		if(space && Math.abs(finalSpeed) > Math.abs(space))
		{
			dashSpeed = space * Math.sign(finalSpeed);
		}

		const foreDistance = this.castRay(
			finalSpeed
			, finalSpeed > 0 ? 0 : Math.PI
			, (i, point) => {
				if(this.getMapSolidAt(...point, this.args.layer))
				{
					return i;
				}
			}
		);

		if(foreDistance !== false)
		{
			dashSpeed = foreDistance * Math.sign(dashSpeed);
		}

		this.args.xSpeed = finalSpeed;
		this.args.ySpeed = 0;

		this.dashTimer = 0;

		this.dashed = true;

		this.args.mode = 0;
		this.args.groundAngle = 0;

		this.args.takeoffPlayed = true;

		if(this.takeoffSound)
		{
			Sfx.play('MECHASONIC_TAKEOFF');
		}
	}

	// get solid() { return !this.occupant; }
	// get isVehicle() { return true; }
	get canRoll() { return true; }
	get controllable() { return true; }
}
