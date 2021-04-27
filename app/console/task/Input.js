import { Task } from 'subspace-console/Task';

export class Input extends Task
{
	static viewport = null;

	static helpText = 'Press a button x for y milliseconds.';
	static useText  = 'input x y';

	title  = 'Input task';
	prompt = '..';

	init(inputId, ms = 500, magnitude = 1)
	{
		let frame, intervalId, onDone = () => {};

		if(inputId[0] === 'a')
		{
			const axisId = inputId.substring(1);

			this.print(`Setting axis ${axisId} to ${magnitude} for ${ms} milliseconds...`);

			frame = {axes: { [axisId]: magnitude }};

			intervalId = setInterval(() => {

				controller.tilt(axisId, magnitude);
				actor.readInput();

			}, 16);

			onDone = () => {

				controller.tilt(axisId, 0);
				actor.readInput();

				clearInterval(intervalId);
			};
		}

		if(inputId[0] === 'b')
		{
			const buttonId = inputId.substring(1);

			this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);

			frame = {buttons: { [buttonId]: 1 }};

			intervalId = setInterval(() => {

				frame.buttons[buttonId] = 1;

				controller.replay(frame);
				actor.readInput();

			}, 16);

			onDone = () => {

				frame.buttons[buttonId] = 0;

				controller.replay(frame);
				actor.readInput();

				clearInterval(intervalId);
			};
		}

		if(!frame)
		{
			return;
		}

		const actor = Input.viewport.controlActor;

		const controller = actor.controller;

		controller.replay(frame);
		actor.readInput();

		return new Promise(accept => {
			setTimeout(() => {
				onDone();
				accept();
			}, ms);
		});
	}

	write(line)
	{
		this.print(line);
	}
}
