import { CharacterString } from '../ui/CharacterString';
import { PointActor } from './PointActor';
import { Tag } from 'curvature/base/Tag';

export class Signpost extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-signpost';

		this.args.width  = 48;
		this.args.height = 256;

		this.args.active = false;
		this.args.follow = false;
	}

	collideA(other)
	{
		if(!other.controllable || this.args.active)
		{
			return;
		}

		this.viewport.onFrameOut(120, () => this.box.setAttribute('data-cleared-by', other.args.name));
		this.viewport.onFrameOut(30,  () => other.args.rolling = false);
		this.viewport.onFrameOut(180, () => this.viewport.clearAct(`${other.args.name} GOT THROUGH ${this.viewport.args.actName}`));

		this.viewport.onFrameOut(540, () => {

			this.args.charStrings = [];

			other.args.ignore = 0;

			this.args.follow = false;

			if(!this.args.boss)
			{
				return;
			}
		});

		this.viewport.onFrameOut(30, () => {
			other.args.ignore = -1;
		});

		this.viewport.onFrameOut(600, () => {

			const boss = this.viewport.actorsById[ this.args.boss ];

			this.viewport.auras.add(boss);

			boss.args.x = this.x + (this.x < 125000 ? 768 : -768);
			boss.args.y = this.y - 160;

			if(this.viewport.controlActor && this.viewport.controlActor.args.jumpForce < 10.5)
			{
				boss.args.y += 48;
			}

			boss.args.phase = 'intro';

			other.args.clearSpeed = 0;
		});

		const time  = (this.viewport.args.frameId - this.viewport.args.startFrameId) / 60;
		let minutes = String(Math.floor(Math.abs(time) / 60)).padStart(2,'0')
		let seconds = String(Math.trunc(Math.abs(time) % 60)).padStart(2,'0');

		const neg = time < 0 ? '-' : '';

		if(neg)
		{
			minutes = Number(minutes);
		}

		const yardsPerFrame = (other.args.gSpeed || other.args.xSpeed) / 32;
		const feetPerSecond = yardsPerFrame * 60 * 3;

		other.args.clearSpeed = Math.abs(feetPerSecond);

		this.args.charStrings = [
			new CharacterString({value: `Speed: ${feetPerSecond.toFixed(2)} ft/sec`})
		];

		this.args.falling = true;
		this.args.active  = true;
		this.args.follow  = true;
		this.args.xSpeed  = (other.args.gSpeed || other.args.xSpeed) * 1.1;
		this.args.ySpeed  = -7;
		this.args.y--;
	}

	update()
	{
		if(this.args.follow)
		{
			const toX = Math.max(this.x, this.viewport.controlActor.x + -160);

			if(toX !== this.x)
			{
				if(!this.args.falling)
				{
					const dustParticle = new Tag(`<div class = "particle-dust">`);

					const dustPoint = this.rotatePoint(this.args.gSpeed, 0);

					dustParticle.style({
						'--x': dustPoint[0] + this.x + -4
						, '--y': dustPoint[1] + this.y
						, 'z-index': 0
						, opacity: Math.random() * 2
					});

					this.viewport.particles.add(dustParticle);

					this.viewport.onFrameOut(30, () => this.viewport.particles.remove(dustParticle));
				}

				this.args.x = toX;
			}

		}

		super.update();
	}

	get rotateLock() { return true; }
}
