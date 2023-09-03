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

	, 'KeyW':  12
	, 'KeyA':  14
	, 'KeyS':  13
	, 'KeyD':  15

	, 'KeyH': 112
	, 'KeyJ': 113
	, 'KeyK': 114
	, 'KeyL': 115

	, 'KeyP':  1020
	, 'KeyO':  1209
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

	, 'PageUp':         1022
	, 'PageDown':       1023
	, 'Home':           1024
	, 'End':            1025

	, 'Escape':         [1020, 1050]

	, 'KeyB':           1201
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

const buttonRemap = {
	0:   1200
	, 1: 1201
	, 9: 1209

	, 4: 1022
	, 5: 1023
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

	update({gamepad} = {})
	{
		for(const i in this.buttons)
		{
			const button = this.buttons[i];

			button.update();
		}

		if(gamepad && this.willRumble)
		{
			// let vibeFactor = 1;

			if(typeof this.willRumble !== 'object')
			{
				this.willRumble = {
					duration:        1000,
					strongMagnitude: 1.0,
					weakMagnitude:   1.0,
				};
			}

			if(gamepad.id && String(gamepad.id).match(/playstation.{0,5}3/i))
			{
				if(this.willRumble.duration < 100 && this.willRumble.strongMagnitude < 0.75)
				{
					this.willRumble.duration = 0;
					this.willRumble.weakMagnitude = 0;
					this.willRumble.strongMagnitude = 0;
				}

				const stopVibing = () => {
					if(this.willRumble)
					{
						return;
					}
					gamepad.vibrationActuator.playEffect("dual-rumble", {
						duration: 0, weakMagnitude: 0, strongMagnitude: 0
					})
				};

				setTimeout(stopVibing, this.willRumble.duration + -1);
			}

			// console.log({...this.willRumble, id: gamepad.id});

			if(gamepad.vibrationActuator && gamepad.vibrationActuator.playEffect)
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

		const tookInput = new Set;

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

					tookInput.add(gamepad);
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

					tookInput.add(keyboard);
				}
			}

			for(let keycode in keys)
			{
				if(pressed[keycode])
				{
					continue;
				}

				let buttonIds = keys[keycode];

				if(!Array.isArray(buttonIds))
				{
					buttonIds = keys[keycode] = [buttonIds];
				}

				for(const buttonId of buttonIds)
				{
					if(keyboard.getKeyCode(keycode) > 0)
					{
						this.press(buttonId, 1);

						pressed[buttonId] = true;
					}
				}
			}
		}

		for(const gamepad of gamepads)
		{
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

				if(this.buttons[i] && !button.pressed && this.buttons[i].active)
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

			for(let keycode in keys)
			{
				let buttonIds = keys[keycode];

				if(!Array.isArray(buttonIds))
				{
					buttonIds = keys[keycode] = [buttonIds];
				}

				for(const buttonId of buttonIds)
				{
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

		for(const concreteId in buttonRemap)
		{
			const abstractId = buttonRemap[concreteId];

			if(released[abstractId])
			{
				continue;
			}

			if(pressed[abstractId])
			{
				continue;
			}

			if(!this.buttons[abstractId])
			{
				this.buttons[abstractId] = new Button;
			}

			if(!this.buttons[concreteId])
			{
				this.buttons[concreteId] = new Button;
			}

			if(this.buttons[concreteId].active)
			{
				this.press(abstractId, this.buttons[concreteId].pressure);
				pressed[abstractId] = true;

			}
			else if(!pressed[abstractId])
			{
				this.release(abstractId, this.buttons[concreteId].pressure);
				released[abstractId] = true;
			}
		}

		return tookInput;
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

	buttonIsMapped(buttonId)
	{
		return buttonId in buttonRemap;
	}

	keyIsMapped(keyCode)
	{
		return keyCode in keys;
	}
}
