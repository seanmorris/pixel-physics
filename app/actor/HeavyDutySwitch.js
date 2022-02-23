import { Switch } from './Switch';

export class HeavyDutySwitch extends Switch
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-switch actor-heavy-duty-switch';

		this.args.height = this.height = 19;
	}
}
