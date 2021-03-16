import { Task } from 'subspace-console/Task';

export class Input extends Task
{
	static viewport = null;

	static helpText = 'Press a button x for y milliseconds.';
	static useText  = 'input x [y = 500]';

	title  = 'Input task';
	prompt = '..';

	init(buttonId, ms = 500)
	{
		this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);

		const frame = {buttons: { [buttonId]: 1 }};
		const actor = Input.viewport.controlActor;

		const controller = actor.controller;

		controller.replay(frame);

		const hold = setInterval(() => controller.replay(frame), 16);

		return new Promise(accept => {
			setTimeout(() => {

				clearInterval(hold);

				frame.buttons[buttonId] = 0;

				controller.replay(frame);

				accept();

			}, ms);
		});
	}
}

