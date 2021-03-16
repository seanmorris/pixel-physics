import { Task } from 'subspace-console/Task';

export class Pos extends Task
{
	static viewport = null;

	static helpText = 'Move the current actor to a position in space.';

	init(x, y)
	{
		const actor = Pos.viewport.controlActor;

		this.print(`Character is at ${actor.x}, ${actor.y}.`);
	}
}
