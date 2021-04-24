import { PointActor } from './PointActor';
import { Projectile } from '../actor/Projectile';
import { Tag }        from 'curvature/base/Tag';

export class Rocks extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-rocks-tall';

		this.args.width  = 48;
		this.args.height = 80;

		this.gone = false;
	}

	update()
	{
		super.update();

		if(this.viewport && this.viewport.args.audio && !this.sample)
		{
			this.sample = new Audio('/Sonic/rock-smash.wav');
			this.sample.volume = 0.3 + (Math.random() * -0.2);
		}
	}

	collideA(other, type)
	{
		super.collideA(other, type);

		if(other.occupant || other.rolling)
		{
			this.pop(other);

			return false;
		}

		if(
			type !== 2
			&& (!this.args.falling || this.args.float === -1)
			&& other.args.ySpeed > 0
			&& other.y < this.y
			&& this.viewport
			&& !this.public.gone
		){
			this.args.gone = true;

			if(this.args.falling && Math.abs(other.args.ySpeed) > 0)
			{
				other.args.xSpeed *= -1;
			}

			this.pop(other);

			return false;
		}

		if(
			(type === 1 || type === 3)
			&& ((Math.abs(other.args.xSpeed) > 10
				|| (Math.abs(other.args.gSpeed) > 10))
				|| (other instanceof Projectile)
			)
			&& this.viewport
			&& !this.public.gone
		){
			this.pop(other);

			return false;
		}

		return true;
	}

	collideB(other)
	{
		if(this.public.gone)
		{
			other.args.ySpeed *= -1;
			other.args.falling = true;
		}
	}


	pop(other)
	{
		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		const particleA = new Tag('<div class = "particle-rock">');
		const particleB = new Tag('<div class = "particle-rock">');
		const particleC = new Tag('<div class = "particle-rock">');
		const particleD = new Tag('<div class = "particle-rock">');
		const particleE = new Tag('<div class = "particle-rock">');
		const particleF = new Tag('<div class = "particle-rock">');
		const particleG = new Tag('<div class = "particle-rock">');
		const particleH = new Tag('<div class = "particle-rock">');

		const direction = Math.sign(other.args.gSpeed || other.args.xSpeed);

		const fuzzFactor = 60;
		const fallSpeed = 1250;
		const xForce    = 180;
		const yForce    = 10;

		particleA.style({
			'--x': this.x
			, '--y': this.y - 10
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleB.style({
			'--x': this.x + 20
			, '--y': this.y - 10
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleC.style({
			'--x': this.x
			, '--y': this.y - 20
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleD.style({
			'--x': this.x + 10
			, '--y': this.y - 20
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleE.style({
			'--x': this.x
			, '--y': this.y - 30
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleF.style({
			'--x': this.x + 20
			, '--y': this.y - 30
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleG.style({
			'--x': this.x
			, '--y': this.y - 40
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		particleH.style({
			'--x': this.x + 10
			, '--y': this.y - 40
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': 50
			, 'z-index': 0
		});

		viewport.particles.add(particleA);
		viewport.particles.add(particleB);
		viewport.particles.add(particleC);
		viewport.particles.add(particleD);
		viewport.particles.add(particleE);
		viewport.particles.add(particleF);
		viewport.particles.add(particleG);
		viewport.particles.add(particleH);

		setTimeout(() => {

			viewport.particles.remove(particleA);
			viewport.particles.remove(particleB);
			viewport.particles.remove(particleC);
			viewport.particles.remove(particleD);
			viewport.particles.remove(particleE);
			viewport.particles.remove(particleF);
			viewport.particles.remove(particleG);
			viewport.particles.remove(particleH);

		}, 512);

		viewport.actors.remove( this );
	}

	get canStick() { return false; }
	get solid() { return true; }
}

