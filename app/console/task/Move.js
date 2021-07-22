import { Task } from 'subspace-console/Task';

export class Move extends Task
{
	static viewport = null;

	static helpText = 'Move the current actor to a position in space.';
	static useText  = 'move x y';

	prompt = '..';

	init(x, y)
	{
		this.print(`Moving character to x, y...`);

		const actor = Move.viewport.controlActor;

		actor.args.x = Number(x);
		actor.args.y = Number(y);

		if(actor.viewport)
		{
			actor.viewport.setColCell(actor);
		}
	}
}
