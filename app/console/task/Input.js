import { Task } from 'subspace-console/Task';

export class Input extends Task
{
	static viewport = null;

	static helpText = 'Press a button x for y milliseconds.';
	static useText  = 'input x y';

	title  = 'Input task';
	prompt = '..';

	init(buttonId, ms = 500)
	{
		this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);

		const frame = {buttons: { [buttonId]: 1 }};
		const actor = Input.viewport.controlActor;

		const controller = actor.controller;

		controller.replay(frame);
		actor.readInput();

		return new Promise(accept => {
			setTimeout(() => {

				frame.buttons[buttonId] = 0;

				controller.replay(frame);
				actor.readInput();

				accept();

			}, ms);
		});
	}

	write(line)
	{
		this.print(line);
	}
}

// import { Task } from 'subspace-console/Task';

// export class Input extends Task
// {
// 	static viewport = null;

// 	static helpText = 'Press a button x for y milliseconds.';
// 	static useText  = 'input x y';

// 	title  = 'Input task';
// 	prompt = '..';

// 	init(buttonId, ms = 500)
// 	{
// 		this.print(`Pressing button ${buttonId} for ${ms} milliseconds...`);

// 		this.actor = Input.viewport.controlActor;
// 		this.frame = {buttons: { [buttonId]: 1 }};

// 		this.buttonId   = buttonId;
// 		this.controller = this.actor.controller;

// 		this.hold = setInterval(() => this.controller.replay(this.frame), 16);
// 		this.ms   = ms;

// 		this.controller.replay(this.frame);

// 		return new Promise(accept => {
// 			setTimeout(() => {

// 				clearInterval(this.hold);

// 				this.frame.buttons[this.buttonId] = 0;

// 				this.controller.replay(this.frame);

// 				accept();

// 			}, this.ms);
// 		});
// 	}

// 	main(line)
// 	{
// 		this.print(line);
// 	}
// }

