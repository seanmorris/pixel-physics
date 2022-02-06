import { Task } from 'subspace-console/Task';

export class Pos extends Task
{
	static viewport = null;

	static helpText = 'Check the current actor\'s position in space.';

	init(x, y)
	{
		if(!Pos.viewport.controlActor)
		{
			return;
		}

		const actor = Pos.viewport.controlActor;

		this.print(`Character is at ${actor.x}, ${actor.y}.`);
	}
}
