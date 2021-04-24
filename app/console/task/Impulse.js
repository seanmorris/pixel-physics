import { Task } from 'subspace-console/Task';

export class Impulse extends Task
{
	static viewport = null;

	static helpText = 'Apply an impulse to the player object.';
	static useText  = 'input magnitude angle';

	title  = 'Impulse task';
	prompt = '..';

	init(magnitude, angle)
	{
		// this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);
		const actor = Impulse.viewport.controlActor;

		actor.impulse(magnitude, angle, true);
	}

	write(line)
	{
		this.print(line);
	}
}
