import { Behavior } from './Behavior';

export class Patrol extends Behavior
{
	update(host)
	{
		const direction = host.args.direction    ?? 1;
		const speed     = host.args.patrolSpeed  ?? 1;
		const offset    = host.args.patrolOffset ?? 0;
		const beat      = host.args.patrolBeat   ?? 90;
		const pause     = host.args.patrolPause  ?? 25;

		host.age = host.age || 0;

		const age = host.age + offset;

		if(age % beat < (beat - pause))
		{
			if(Math.floor(age / beat) % 2)
			{
				host.args.gSpeed = -speed;
			}
			else
			{
				host.args.gSpeed = speed;
			}

			host.args.direction = -Math.sign(host.args.gSpeed) || host.args.direction;
		}
		else
		{
			host.args.direction = -Math.sign(host.gSpeedLast) || host.args.direction;
		}
	}
}
