import { Task } from 'subspace-console/Task';

export class Spawn extends Task
{
	static viewport = null;

	static helpText = 'Spawn an object.';

	init(typeName)
	{
		if(!Spawn.viewport || !Spawn.viewport.controlActor)
		{
			return;
		}

		const palette = Spawn.viewport.objectPalette;
		const actor   = Spawn.viewport.controlActor;

		if(!typeName)
		{
			this.print(Object.keys(palette).join(', '));
			return;
		}

		const type = palette[typeName];

		if(!type)
		{
			this.print('Type not found: "${typeName}".');
		}

		Spawn.viewport.spawn.add({object: new type({
			x: actor.x + 128
			, y: actor.y - 128
		})});
	}
}
