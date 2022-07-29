import { Behavior } from './Behavior';

export class Patrol extends Behavior
{
	update(host)
	{
		const direction = host.args.direction   ?? 1;
		const speed     = host.args.patrolSpeed ?? 1;
		const beat      = host.args.patrolBeat  ?? 90;
		const pause     = host.args.patrolPause ?? 25

		if(host.age % beat < (beat - pause))
		{
			if(Math.floor(host.age / beat) % 2)
			{
				host.args.gSpeed = -speed;
			}
			else
			{
				host.args.gSpeed = speed;
			}
		}
	}
}
