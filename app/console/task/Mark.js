import { Router } from 'curvature/base/Router';
import { Task } from 'subspace-console/Task';

export class Mark extends Task
{
	static viewport = null;

	static helpText = 'Mark the current actor\'s position in space as a start position.';

	init(x, y)
	{
		if(!Mark.viewport.controlActor)
		{
			return;
		}

		const actor = Mark.viewport.controlActor;

		this.print(`Character is at ${actor.x}, ${actor.y}.`);

		Router.setQuery('map', Mark.viewport.baseMap.replace(/^\/map\//, ''));
		Router.setQuery('start', `${Math.round(actor.x)},${Math.round(actor.y)}`);
	}
}
