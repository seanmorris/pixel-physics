import { Spring } from '../actor/Spring';
import { OrbSmall } from '../actor/OrbSmall';
import { WoodenCrate } from '../actor/WoodenCrate';
import { SkidDust } from '../behavior/SkidDust';
import { Ring } from '../actor/Ring';

export class InfiniteRuin
{
	update(frameId, viewport)
	{
		if(!viewport.controlActor)
		{
			return;
		}

		// if(frameId > 120)
		// {
		// 	viewport.arg.fake = 'fail';
		// }

		if(viewport.controlActor.args.dead || viewport.controlActor.args.startled)
		{
			return;
		}

		if(frameId < 30 && viewport.controlActor)
		{
			viewport.controlActor.args.gSpeed = 15;
		}

		let freq = 120;

		if(frameId < 600)
		{
			freq = 150;
		}

		if(frameId > 1200)
		{
			freq = 100;
		}

		if(frameId > 1800)
		{
			freq = 90;
		}

		if(frameId > 120 && frameId % freq === 0 && viewport.controlActor)
		{
			let rand = Math.random();

			this.spawnRings(viewport, rand > 0.25 ? 32 : 0);

			if(frameId < 900)
			{
				rand = 0;
			}

			if(frameId < 900)
			{
				rand *= 0.79;
			}

			if(viewport.objectDb.has(WoodenCrate))
			{
				if(viewport.objectDb.get(WoodenCrate).size)
				{
					rand = 0;
				}
			}

			if(rand > 0.5)
			{
				this.spawnBox(viewport);
			}
			else
			{
				this.spawnOrb(viewport);
			}
		}
	}

	spawnOrb(viewport)
	{
		const thing = new OrbSmall;
		const type  = Math.trunc(Math.random() * 8);

		thing.args.xSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;
		thing.args.gSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;

		switch(type)
		{
			case 0:
				thing.args.x = viewport.controlActor.args.x + 320;
				thing.args.y = 928 - 320;
				thing.args.friction = 0.75;
				thing.args.bounce   = 0.75;
				break;

			case 1:
				thing.args.x = viewport.controlActor.args.x + 320;
				thing.args.y = 928 - 320;
				thing.args.friction = 0.70;
				thing.args.bounce   = 0.75;
				break;

			case 2:
				thing.args.x = viewport.controlActor.args.x + 400;
				thing.args.y = 928 - 0;
				thing.args.decel = 0.05;
				thing.args.bounce   = 0.0;
				thing.args.gSpeed = 18;
				thing.args.xSpeed = 18;
				break;

			case 3:
				thing.args.x = viewport.controlActor.args.x + 400;
				thing.args.y = 928 - 0;
				thing.args.decel = 0.2;
				thing.args.bounce = 0.0;
				thing.args.gSpeed = 18;
				thing.args.xSpeed = 18;
				break;

			case 4:
				thing.args.x = viewport.controlActor.args.x + 400;
				thing.args.y = 928 - 48;
				thing.args.friction = 0.90;
				thing.args.decel = 0.15;
				thing.args.bounce = 0.999;
				break;

			case 5:
				thing.args.x = viewport.controlActor.args.x + 400;
				thing.args.y = 928 - 24;
				thing.args.friction = 0.80;
				thing.args.decel = 0.15;
				thing.args.bounce = 0.999;
				break;

			case 6:
				thing.args.x = viewport.controlActor.args.x + 320;
				thing.args.y = 928 - 320;
				thing.args.friction = 0.75;
				thing.args.bounce   = 0.70;
				break;

			case 7:
				thing.args.x = viewport.controlActor.args.x + 320;
				thing.args.y = 928 - 320;
				thing.args.friction = 0.70;
				thing.args.bounce   = 0.80;
				break;
		}

		thing.args.canHide  = true;

		viewport.spawn.add({object: thing});
	}

	spawnBox(viewport)
	{
		let thing;
		thing = new WoodenCrate;

		let type = Math.trunc(Math.random() * 8);

		thing.args.x = viewport.controlActor.args.x + 320;
		thing.args.y = 928 - 320;
		thing.args.friction = 0.76;
		thing.args.bounce   = 0.65;
		thing.args.contains = 'ring-monitor';
		thing.alwaysSkidding = true;
		thing.dustFreq = 5;

		thing.behaviors.add(new SkidDust);

		thing.args.xSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;
		thing.args.gSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;

		viewport.spawn.add({object: thing});
	}

	spawnRings(viewport, offset = 0)
	{
		for(let i = 0; i < 3; i++)
		{
			const thing = new Ring;
			const type = Math.trunc(Math.random() * 8);

			thing.args.x = viewport.controlActor.args.x + 320 + (i * 32);
			thing.args.y = 928 + -16 + -offset;

			viewport.spawn.add({object: thing});
		}
	}

	spawnSpring(viewport)
	{
		let thing;
		thing = new Spring;

		let type = Math.trunc(Math.random() * 8);

		thing.args.x = viewport.controlActor.args.x + 320;
		thing.args.y = 928 - 320;
		thing.args.decel    = 0.03;
		thing.args.power    = 10;
		thing.args.width    = 32;
		thing.args.height   = 16;
		thing.args.angle    = -Math.PI / 2;
		thing.args.groundAngle = 0;
		thing.args.static   = false;
		thing.args.canHide  = true;
		thing.alwaysSkidding = true;
		thing.float    = 0;
		thing.dustFreq = 5;

		thing.behaviors.add(new SkidDust);

		thing.args.xSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;
		thing.args.gSpeed = viewport.controlActor.args.gSpeed || viewport.controlActor.args.xSpeed;

		viewport.spawn.add({object: thing});

		const originalSleep = thing.sleep;

		thing.sleep = () => viewport.actors.remove(thing);
	}
}
