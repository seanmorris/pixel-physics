import { PointActor } from './PointActor';
import { Projectile } from '../actor/Projectile';
import { Tag }        from 'curvature/base/Tag';
import { Sfx }        from '../audio/Sfx';

export class Rocks extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

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

	collideA(other, type)
	{
		if(this.args.gone)
		{
			return false;
		}

		super.collideA(other, type);

		if(other.occupant || other.args.rolling || other.punching)
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
			&& !this.args.gone
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
			&& other instanceof Projectile
			&& this.viewport
			&& !this.args.gone
		){
			this.pop(other);

			return false;
		}

		return true;
	}

	// collideB(other)
	// {
	// 	if(other.args.falling && this.args.gone)
	// 	{
	// 		other.args.ySpeed *= -1;
	// 		other.args.falling = true;
	// 	}

	// 	return false;
	// }

	pop(other)
	{
		this.args.gone = true;

		const viewport = this.viewport;

		if(!viewport)
		{
			return;
		}

		Sfx.play('ROCKS_DESTROYED');

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

		this.onNextFrame(() => viewport.actors.remove( this ));
	}

	get canStick() { return false; }
	get solid() { return !this.args.gone; }
}

