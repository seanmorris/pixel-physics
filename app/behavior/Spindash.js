import { Tag  } from 'curvature/base/Tag';

import { Behavior } from './Behavior';

export class Spindash extends Behavior
{
	command_0(host, button)
	{
		if(host.args.falling || host.args.gSpeed)
		{
			return;
		}

		if(host.yAxis < 0.55 && !host.args.gSpeed)
		{
			return;
		}

		host.spindashCharge += 10;

		this.showDashDust(host);

		return false;
	}

	update(host)
	{
		host.spindashCharge = host.spindashCharge || 0;

		if(host.spindashCharge)
		{
			if(host.spindashCharge < 1)
			{
				host.spindashCharge = 0;
			}
			else
			{
				host.args.animation = 'spindash';
				// host.args.animation = 'rolling';

				host.spindashCharge -= 0.2;

				if(this.dashDust)
				{
					this.dashDust.style({'--dashCharge': host.spindashCharge});
				}

				let dashCharge = host.spindashCharge / 20;

				if(dashCharge > 1)
				{
					dashCharge = 1;
				}

				// this.twist(120 * dashCharge * this.args.direction);
			}
		}

		if(!host.yAxis && host.spindashCharge)
		{
			if(host.spindashCharge < 5 && (host.args.modeTime < 45 || host.args.skidding))
			{
				host.spindashCharge = 15;
			}

			const direction = host.args.facing === 'left' ? -1:1;
			let   dashPower = host.spindashCharge / 40;

			if(dashPower > 1)
			{
				dashPower = 1;
			}

			host.args.rolling = true;

			const dashBoost = dashPower * 32;

			host.castRayQuick(
				dashBoost * Math.sign(direction)
				, [Math.PI,0,0][1 + Math.sign(direction)]
				, [0, host.args.height/2]
			);

			if(Math.sign(direction) !== Math.sign(host.args.gSpeed))
			{
				host.args.gSpeed = dashBoost * Math.sign(direction);
			}
			else
			{
				host.args.gSpeed += dashBoost * Math.sign(direction);
			}

			host.args.ignore = 1;
			host.args.rolling = true;

			host.spindashCharge = 0;

			if(this.dashDust)
			{
				this.dashDust.remove();
				this.dashDust = false;
			}
		}
	}

	showDashDust(host)
	{
		const dustPoint = host.rotatePoint(0, 0);

		if(this.dashDust)
		{
			this.dashDust.style({
				'--x': dustPoint[0] + host.args.x
				, '--y': dustPoint[1] + host.args.y
				, '--direction': host.args.direction
				, '--dashCharge': host.spindashCharge
			});
			return;
		}

		const viewport = host.viewport;

		const dustParticle = new Tag('<div class = "particle-spindash-dust">');

		dustParticle.style({
			'--x': dustPoint[0] + host.args.x
			, '--y': dustPoint[1] + host.args.y
			, '--direction': host.args.direction
			, '--dashCharge': host.spindashCharge
		});

		dustParticle.setAttribute('data-facing', host.args.facing);

		viewport.particles.add(dustParticle);

		this.dashDust = dustParticle;
	}
}
