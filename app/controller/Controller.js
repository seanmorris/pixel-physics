import { Axis } from './Axis';
import { Button } from './Button';

const keys = {
	'Space': 0

	, 'Enter':       0
	, 'NumpadEnter': 0

	, 'ControlLeft':  1
	, 'ControlRight': 1

	, 'ShiftLeft':  2
	, 'ShiftRight': 2

	, 'KeyZ':   3
	, 'KeyQ':   4
	, 'KeyE':   5

	, 'Digit1': 6
	, 'Digit3': 7

	, 'KeyBackspace': 8

	, 'KeyW': 12
	, 'KeyA': 14
	, 'KeyS': 13
	, 'KeyD': 15

	, 'KeyH': 112
	, 'KeyJ': 113
	, 'KeyK': 114
	, 'KeyL': 115

	, 'KeyP':  1020
	, 'Pause': 1020

	, 'Tab': 11

	, 'ArrowUp':    12
	, 'ArrowDown':  13
	, 'ArrowLeft':  14
	, 'ArrowRight': 15

	, 'KeyMeta': 16

	, 'Numpad4': 112
	, 'Numpad2': 113
	, 'Numpad8': 114
	, 'Numpad6': 115

	, 'Backquote':      1010
	, 'NumpadAdd':      1011
	, 'NumpadSubtract': 1012
	, 'NumpadMultiply': 1013
	, 'NumpadDivide':   1014

	, 'Escape':         1020
};

[...Array(12)].map((x,fn) => keys[ `F${fn}` ] = 2000 + fn);

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

const buttonMap = {
	'-6': 14
	, '+6': 15
	, '-7': 12
	, '+7': 13
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

	readInput({keyboard, gamepads = []})
	{
		const tilted   = {};
		const pressed  = {};
		const released = {};

		for(let i = 0; i < gamepads.length; i++)
		{
			const gamepad = gamepads[i];

			if(!gamepad)
			{
				continue;
			}

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

		for(let i = 0; i < gamepads.length; i++)
		{
			const gamepad = gamepads[i];

			if(!gamepad)
			{
				continue;
			}

			for(const i in gamepad.buttons)
			{
				if(released[i])
				{
					continue;
				}

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

		for(let i = 0; i < gamepads.length; i++)
		{
			const gamepad = gamepads[i];

			if(!gamepad)
			{
				continue;
			}

			for(const i in gamepad.axes)
			{
				const axis = gamepad.axes[i];

				if(Math.abs(axis) < this.deadZone)
				{
					if(!tilted[i])
					{
						this.tilt(i, 0);
					}

					continue;
				}

				tilted[i] = true;

				this.tilt(i, axis);
			}
		}

		for(let inputId in axisMap)
		{
			if(!this.buttons[inputId])
			{
				this.buttons[inputId] = new Button;
			}

			const axis   = axisMap[ inputId ];
			const value  = Math.sign(1/axis);
			const axisId = Math.abs(axis);

			if(tilted[axisId])
			{
				continue;
			}

			if(this.buttons[inputId].active)
			{
				tilted[axisId] = true;

				this.tilt(axisId, value);
			}
			else if(!tilted[axisId])
			{
				this.tilt(axisId, 0);
			}
		}

		for(let axisMove in buttonMap)
		{
			const buttonId = buttonMap[axisMove];

			if(released[buttonId])
			{
				continue;
			}

			if(pressed[buttonId])
			{
				continue;
			}

			const [move, axisId] = [axisMove.slice(0, 1), axisMove.slice(1)];

			if(!this.axes[axisId])
			{
				this.axes[axisId] = new Axis({deadZone:this.deadZone})
			}

			const axis = this.axes[axisId];

			if(axis.magnitude && Math.sign(axisMove) !== Math.sign(axis.magnitude))
			{
				continue;
			}

			const pressure = Math.abs(axis.magnitude);

			if(pressure)
			{
				this.press(buttonId, pressure);
				pressed[buttonId] = true;
			}
			else
			{
				this.release(buttonId, pressure);
				released[buttonId] = true;
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
