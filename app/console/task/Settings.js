import { Task } from 'subspace-console/Task';

export class Settings extends Task
{
	static viewport = null;

	static helpText = 'Get/set the values of settings variables.';
	static useText  = 'set key val';

	prompt = '..';

	init(key, val)
	{
		const viewport = Settings.viewport;

		if(val !== undefined)
		{
			viewport.settings[key] = JSON.parse(val);
		}

		this.print(JSON.stringify(viewport.settings[key]));
	}
}
