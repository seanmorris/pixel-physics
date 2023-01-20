import { Behavior } from './Behavior';

const rendered = Symbol('rendered');

export class Liftable extends Behavior
{
	rendered(host)
	{
		if(host[rendered])
		{
			return;
		}

		host[rendered] = true;

		host.bindTo('carriedBy', carrier => {
			if(host.cX) { host.cX(); host.cX = null; }
			if(host.cY) { host.cY(); host.cY = null; }

			if(host.carriedBy)
			{
				const carrier = host.carriedBy;

				host.carriedBy = null;

				host.args.xSpeed = carrier.args.xSpeed;
				host.args.ySpeed = carrier.args.falling ? carrier.args.ySpeed : 0;

				host.args.xSpeed += Math.sign(carrier.args.gSpeed || carrier.args.xSpeed) * 4;
				host.args.ySpeed -= 4;

				carrier.carrying.delete(host);

				host.args.falling = true;
				host.args.float = 0;
			}

			if(carrier)
			{
				host.cX = carrier.args.bindTo('x', v => host.args.x = v + carrier.args.direction * carrier.xHold);
				host.cY = carrier.args.bindTo('y', v => host.args.y = v + -carrier.yHold);

				host.args.xSpeed = 0;
				host.args.ySpeed = 0;

				carrier.carrying.add(host);

				host.args.float = -1;
			}
		});
	}

	update(host)
	{
		if(host.carriedBy)
		{
			host.args.float = -1;
		}
	}
}
