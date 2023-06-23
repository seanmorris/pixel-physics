import { Task } from 'subspace-console/Task';

export class Move extends Task
{
	static viewport = null;

	static helpText = 'Move the current actor to a position in space.';
	static useText  = 'move x y';

	prompt = '..';

	init(x, y)
	{
		if(!Move.viewport.controlActor)
		{
			return;
		}

		this.print(`Moving character to x, y...`);

		const actor = Move.viewport.controlActor;

		actor.args.x = parseFloat(x);
		actor.args.y = parseFloat(y);

		if(actor.viewport)
		{
			actor.viewport.setColCell(actor);
		}
	}
}
