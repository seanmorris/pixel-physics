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

		this.particleA = new Tag('<div class = "particle-rock">');
		this.particleB = new Tag('<div class = "particle-rock">');
		this.particleC = new Tag('<div class = "particle-rock">');
		this.particleD = new Tag('<div class = "particle-rock">');
		this.particleE = new Tag('<div class = "particle-rock">');
		this.particleF = new Tag('<div class = "particle-rock">');
		this.particleG = new Tag('<div class = "particle-rock">');
		this.particleH = new Tag('<div class = "particle-rock">');
	}

	onAttached()
	{
		// const direction = Math.sign(other.args.gSpeed || other.args.xSpeed);

		let direction = -1;

		const fuzzFactor = 20;
		const fallSpeed = 1550;
		const xForce    = 60;
		const yForce    = 40;

		const particleA =this.particleA;
		const particleB =this.particleB;
		const particleC =this.particleC;
		const particleD =this.particleD;
		const particleE =this.particleE;
		const particleF =this.particleF;
		const particleG =this.particleG;
		const particleH =this.particleH;

		particleA.style({
			'--x': this.x - 8
			, '--y': this.y - 8
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		direction *= -1;

		particleB.style({
			'--x': this.x + 8
			, '--y': this.y - 0
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce
			, 'z-index': 0
		});

		direction *= -1;

		particleC.style({
			'--x': this.x
			, '--y': this.y - 18
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce * 1.1
			, 'z-index': 0
		});

		direction *= -1;

		particleD.style({
			'--x': this.x + 8
			, '--y': this.y - 10
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce * 1.1
			, 'z-index': 0
		});

		direction *= -1;

		particleE.style({
			'--x': this.x - 8
			, '--y': this.y - 28
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce * 1.2
			, 'z-index': 0
		});

		direction *= -1;

		particleF.style({
			'--x': this.x + 8
			, '--y': this.y - 20
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce * 1.2
			, 'z-index': 0
		});

		direction *= -1;

		particleG.style({
			'--x': this.x - 8
			, '--y': this.y - 30
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': yForce * 1.2
			, 'z-index': 0
		});

		direction *= -1;

		particleH.style({
			'--x': this.x + 8
			, '--y': this.y - 30
			, '--fallSpeed': fallSpeed + (fuzzFactor * Math.random())
			, '--xMomentum': (xForce * direction) + (fuzzFactor * Math.random())
			, '--yMomentum': 50 * 1.3
			, 'z-index': 0
		});
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
		if(this.public.gone)
		{
			return false;
		}

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
		if(other.args.falling && this.public.gone)
		{
			other.args.ySpeed *= -1;
			other.args.falling = true;
		}

		return false;
	}


	pop(other)
	{
		this.args.gone = true;

		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		if(viewport.args.audio && this.sample)
		{
			this.sample.play();
		}

		const particleA =this.particleA;
		const particleB =this.particleB;
		const particleC =this.particleC;
		const particleD =this.particleD;
		const particleE =this.particleE;
		const particleF =this.particleF;
		const particleG =this.particleG;
		const particleH =this.particleH;

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

		}, 2500);

		viewport.actors.remove( this );
	}

	get canStick() { return false; }
	get solid() { return true; }
}

