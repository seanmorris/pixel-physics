import { Axis } from './Axis';
import { Button } from './Button';

const keys = {
	'Space': 0

	, 'Enter':   0
	, 'NumpadEnter': 0

	, 'ControlLeft': 1
	, 'ControlRight': 1

	, 'ShiftLeft':   2
	, 'ShiftRight':   2

	, 'KeyZ': 3
	, 'KeyQ': 4
	, 'KeyE': 5


	, 'KeyW': 12
	, 'KeyA': 14
	, 'KeyS': 13
	, 'KeyD': 15

	, 'KeyH': 112
	, 'KeyJ': 113
	, 'KeyK': 114
	, 'KeyL': 115

	, 'KeyP': 9
	, 'Pause': 9

	, 'Tab': 11

	, 'ArrowUp':    12
	, 'ArrowDown':  13
	, 'ArrowLeft':  14
	, 'ArrowRight': 15

	, 'Numpad4': 112
	, 'Numpad2': 113
	, 'Numpad8': 114
	, 'Numpad6': 115

	, 'Backquote': 1010
};

[...Array(12)].map((x,fn) => keys[ `F${fn}` ] = 1000 + fn);

const axisMap = {
	12:   -1
	, 13: +1
	, 14: -0
	, 15: +0

	, 112: -2
	, 113: +3
	, 114: -3
	, 115: +2
};

export class Controller
{
	constructor({keys = {}, deadZone = 0, gamepad = null, keyboard = null})
	{
		this.deadZone = deadZone;

		Object.defineProperties(this, {
			buttons:    { value: {} }
			, pressure: { value: {} }
			, axes:     { value: {} }
			, keys:     { value: {} }
		});
	}

	update({gamepad})
	{
		for(const i in this.buttons)
		{
			const button = this.buttons[i];

			button.update();
		}

		if(gamepad && this.willRumble)
		{
			if(typeof this.willRumble !== 'object')
			{
				this.willRumble = {
					duration: 1000,
					strongMagnitude: 1.0,
					weakMagnitude: 1.0
				};
			}

			if(gamepad.vibrationActuator)
			{
				gamepad.vibrationActuator.playEffect("dual-rumble", this.willRumble);
			}

			this.willRumble = false;
		}
	}

	rumble(options = true)
	{
		this.willRumble = options;
	}

	readInput({keyboard, gamepad})
	{
		const pressed  = {};
		const released = {};

		if(gamepad)
		{
			for(const i in gamepad.buttons)
			{
				const button = gamepad.buttons[i];

				if(button.pressed)
				{
					this.press(i, button.value);

					pressed[i] = true;
				}
			}
		}

		if(keyboard)
		{
			for(const i in [...Array(10)])
			{
				if(pressed[i])
				{
					continue;
				}

				if(keyboard.getKeyCode(i) > 0)
				{
					this.press(i, 1);

					pressed[i] = true;
				}
			}

			for(const keycode in keys)
			{
				if(pressed[keycode])
				{
					continue;
				}

				const buttonId = keys[keycode];

				if(keyboard.getKeyCode(keycode) > 0)
				{
					this.press(buttonId, 1);

					pressed[buttonId] = true;
				}
			}
		}

		if(gamepad)
		{
			for(const i in gamepad.buttons)
			{
				if(pressed[i])
				{
					continue;
				}

				const button = gamepad.buttons[i];

				if(!button.pressed)
				{
					this.release(i);

					released[i] = true;
				}
			}
		}

		if(keyboard)
		{
			for(const i in [...Array(10)])
			{
				if(released[i])
				{
					continue;
				}

				if(pressed[i])
				{
					continue;
				}

				if(keyboard.getKeyCode(i) < 0)
				{
					this.release(i);

					released[i] = true;
				}
			}

			for(const keycode in keys)
			{
				const buttonId = keys[keycode];

				if(released[buttonId])
				{
					continue;
				}

				if(pressed[buttonId])
				{
					continue;
				}

				if(keyboard.getKeyCode(keycode) < 0)
				{
					this.release(buttonId);

					released[keycode] = true;
				}
			}
		}

		const tilted = {};

		if(gamepad)
		{
			for(const i in gamepad.axes)
			{
				const axis = gamepad.axes[i];

				tilted[i] = true;

				this.tilt(i, axis);
			}
		}

		for(const buttonId in axisMap)
		{
			if(!this.buttons[buttonId])
			{
				this.buttons[buttonId] = new Button;
			}

			const axis   = axisMap[ buttonId ];
			const value  = Math.sign(1/axis);
			const axisId = Math.abs(axis);

			if(this.buttons[buttonId].active)
			{
				tilted[axisId] = true;

				this.tilt(axisId, value);
			}
			else if(!tilted[axisId])
			{
				this.tilt(axisId, 0);
			}
		}
	}

	tilt(axisId, magnitude)
	{
		if(!this.axes[axisId])
		{
			this.axes[axisId] = new Axis({deadZone:this.deadZone});
		}

		this.axes[axisId].tilt(magnitude);
	}

	press(buttonId, pressure = 1)
	{
		if(!this.buttons[buttonId])
		{
			this.buttons[buttonId] = new Button;
		}

		this.buttons[buttonId].press(pressure);
	}

	release(buttonId)
	{
		if(!this.buttons[buttonId])
		{
			this.buttons[buttonId] = new Button;
		}

		this.buttons[buttonId].release();
	}

	serialize()
	{
		const buttons = {};

		for(const i in this.buttons)
		{
			buttons[i] = this.buttons[i].pressure;
		}

		const axes = {};

		for(const i in this.axes)
		{
			axes[i] = this.axes[i].magnitude;
		}

		return {axes, buttons};
	}

	replay(input)
	{
		if(input.buttons)
		{
			for(const i in input.buttons)
			{
				if(input.buttons[i] > 0)
				{
					this.press(i, input.buttons[i]);
				}
				else
				{
					this.release(i);
				}
			}
		}

		if(input.axes)
		{
			for(const i in input.axes)
			{
				if(input.axes[i].magnitude !== input.axes[i])
				{
					this.tilt(i, input.axes[i]);
				}
			}
		}
	}

	zero()
	{
		for(const i in this.axes)
		{
			this.axes[i].zero();
		}

		for(const i in this.buttons)
		{
			this.buttons[i].zero();
		}
	}
}
