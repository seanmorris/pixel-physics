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
		if(!Impulse.viewport.controlActor)
		{
			return;
		}

		// this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);
		let actor = Impulse.viewport.controlActor;

		if(actor.standingOn && actor.standingOn.isVehicle)
		{
			actor = actor.standingOn;
		}

		actor.impulse(magnitude, angle, true);
	}

	write(line)
	{
		this.print(line);
	}
}
