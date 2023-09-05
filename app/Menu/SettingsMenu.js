import { TraceMenu } from './TraceMenu';
import { GamepadConfig } from '../controller/GamepadConfig';
import { Series } from '../intro/Series';

import { ButtonSelect } from './ButtonSelect';

import { DemoMenu } from './DemoMenu';

const videoMenu = parent => ({
	classes: 'right-align'
	,subtext: 'Video settings.'
	, children: {
		// 'Tile Scale': {
		// 	input: 'number'
		// 	, subtext: 'Scale.'
		// 	, revert: () => parent.args.tileScale = 1
		// 	, set: value => parent.args.tileScale = value
		// 	, get: () => parent.args.tileScale
		// 	, min: 0.1
		// 	, step: 0.1
		// }

		'Motion Blur Effects': {
			input: 'boolean'
			, subtext: 'Enable/Disable Motion Blur Effects'
			, revert: () => parent.settings.blur = true
			, set: value => parent.settings.blur = value
			, get: () => parent.settings.blur
		}

		, 'Displacement Effects': {
			input: 'boolean'
			, subtext: 'Enable/Disable Displacement Effects'
			, revert: () => parent.settings.displace = true
			, set: value => parent.settings.displace = value
			, get: () => parent.settings.displace
		}

		, 'Scaling': {
			input: 'boolean'
			, subtext: 'Enable/Disable Scaling'
			, revert: value => parent.settings.scaling = true
			, set: value => parent.settings.scaling = value
			, get: () => parent.settings.scaling
		}

		, 'Smoothing': {
			input: 'boolean'
			, subtext: 'Enable/Disable Smoothing'
			, revert: value => parent.settings.smoothing = false
			, set: value => parent.settings.smoothing = value
			, get: () => parent.settings.smoothing
		}

		, 'Outline Thickness': {
			input: 'number'
			, subtext: 'Change the Outline Thickness'
			, revert: value => parent.settings.outline = 1
			, set: value => parent.settings.outline = value
			, get: () => parent.settings.outline
			, step: 0.5
			, max: 15
			, min: 0
		}

		// , 'Frameskip': {
		// 	input: 'number'
		// 	, subtext: 'Change the frameskip'
		// 	, set: value => parent.settings.frameSkip = value
		// 	, get: () => parent.settings.frameSkip
		// 	, max: 8
		// 	, min: 0
		// }

		, 'Display HUD': {
			input: 'boolean'
			, subtext: 'Enable/Disable the HUD'
			, revert: value => parent.settings.showHud = true
			, set: value => parent.settings.showHud = value
			, get: () => parent.settings.showHud
		}

		// , 'Debug OSD': {
		// 	input: 'boolean'
		// 	, subtext: 'Enable/Disable Debug OSD'
		// 	, set: value => parent.settings.debugOsd = value
		// 	, get: () => parent.settings.debugOsd
		// }

		, 'FPS Meter': {
			input: 'boolean'
			, subtext: 'Enable/Disable the FPS Meter'
			, revert: value => parent.settings.showFps = true
			, set: value => parent.settings.showFps = value
			, get: () => parent.settings.showFps
		}

		, 'Mute/Fullscreen': {
			input: 'boolean'
			, subtext: 'Show the mute & fullscreen controls in the bottom right.'
			, revert: value => parent.settings.shortcuts = true
			, set: value => parent.settings.shortcuts = value
			, get: () => parent.settings.shortcuts
		}
	}
});

const audioMenu = parent => ({
	subtext: 'Audio settings.'
	, children: {
		'Mute': {
			input: 'boolean'
			, subtext: 'Mute all audio'
			, revert: () => parent.args.audio = true
			, watch: [parent.args, 'audio', v => !v]
			, set: value => parent.args.audio = !value
			// , get: () => !parent.args.audio
		}
		, 'Music Volume': {
			input: 'number'
			, subType: 'range'
			, subtext: 'Background music volume - 0% - 100%'
			// , available: 'unavailable'
			, revert: () => parent.settings.musicVol = parent.defaults.musicVol
			, set: value => parent.settings.musicVol = value
			, get: () => parent.settings.musicVol
			, max: 100
			, min: 0
		}
		, 'SFX': {
			input: 'number'
			, subType: 'range'
			, subtext: 'Sound effect music volume - 0% - 100%'
			// , available: 'unavailable'
			, revert: () => parent.settings.sfxVol = parent.defaults.sfxVol
			, set: value => parent.settings.sfxVol = value
			, get: () => parent.settings.sfxVol
			, max: 100
			, min: 0
		}
		// , 'Mono / Stereo': {
		// 	available: 'unavailable'
		// }
	}
});
const inputMenu = parent => ({
	subtext: 'Input settings.'
	, children: {
		// 'Gamepad Test': {
		// 	callback: (item,menu) => {
		// 		menu.args.override = new GamepadConfig({}, parent);
		// 		menu.args.override.onRemove(() => {
		// 			menu.args.override = null;
		// 			menu.onNextFrame(()=>menu.focusFirst());
		// 		});
		// 		// const cards = [
		// 		// 	new GamepadConfig({timeout: -1}, parent)
		// 		// 	, ...parent.homeCards()
		// 		// ];

		// 		// parent.args.titlecard = new Series({cards}, parent);

		// 		// parent.args.titlecard.play();
		// 	}
		// }

		// 'Select A Button': {
		// 	callback: (item,menu) => {
		// 		console.log('Select a button!');
		// 		menu.args.override = new ButtonSelect({},menu);
		// 		menu.args.override.onRemove(() => {
		// 			menu.args.override = null;
		// 			menu.onNextFrame(()=>menu.focusFirst());
		// 		});
		// 	}
		// }

		'Output test': {
			input: 'output'
			// , bind: i => {
			// 	console.trace(i);
			// 	return parent.settings.bindTo('buttonTest', v => {
			// 		i.setting = v
			// 	})
			// }
			, watch: [parent.settings, 'buttonTest']
			, set: value => parent.settings.buttonTest = value
			// , get: () => parent.settings.buttonTest
		}

		, 'Button Font Test': {
			input: 'select'
			, options: [
				''
				, '⓿', '❶', '❷', '❸', '❹', '❺'
				, '❻', '❼', '❽', '❾', '❿', '⓫'
				, '✚', '←', '→', '↑', '↓'
				// , '▦', '🡠', '🡢', '🡡', '🡣'
				, '⬲', '🡨', '🡪', '🡩', '🡫'
				, '⟴', '🡰', '🡲', '🡱', '🡳'
			]
			, set: value => parent.settings.buttonTest = value
			, get: () => parent.settings.buttonTest
		}
		, 'Rumble': {
			input: 'boolean'
			, subtext: 'Enable/Disable controller vibration'
			, set: value => parent.settings.rumble = value
			, get: () => parent.settings.rumble
		}
	}
});
const networkMenu = parent => ({
	subtext: 'Network settings.'
	, children: {
		// 'Username': {
		// 	input: 'string'
		// 	, subtext: 'Name to display in online games'
		// 	, revert: () => parent.settings.username = parent.defaults.username
		// 	, set: value => parent.settings.username = value
		// 	, get: () => parent.settings.username
		// }
		'Matrix Settings': {
			children: {
				'Matrix URL': {
					input: 'string'
					, subtext: 'Matrix Server URL for lobby.'
					, revert: () => parent.settings.matrixUrl = parent.defaults.matrixUrl
					, set: value => parent.settings.matrixUrl = value
					, get: () => parent.settings.matrixUrl
				}

				, 'Lobby': {
					input: 'string'
					, subtext: 'Matrix Room for lobby.'
					, revert: () => parent.settings.matrixRoom = parent.defaults.matrixRoom
					, set: value => parent.settings.matrixRoom = value
					, get: () => parent.settings.matrixRoom
				}
			}
		}

		// , 'Subspace Hub Servers': {}

		, 'ICE Servers': {
			children: {
				'ICE Server #1': {
					input: 'string'
					, subtext: 'ICE candidate server.'
					, revert: () => parent.settings.iceServer1 = parent.defaults.iceServer1
					, set: value => parent.settings.iceServer1 = value
					, get: () => parent.settings.iceServer1
				}
				, 'ICE Server #2': {
					input: 'string'
					, subtext: 'ICE candidate server.'
					, revert: () => parent.settings.iceServer2 = parent.defaults.iceServer2
					, set: value => parent.settings.iceServer2 = value
					, get: () => parent.settings.iceServer2
				}
			}
		}

	}
});

export const SettingsMenu = (parent) => { return {
	subtext: 'Edit your configuration.'
	, children: () => {

		const children = {
			Video: videoMenu(parent)
			, Audio: audioMenu(parent)
			, Input: inputMenu(parent)
			, Network: networkMenu(parent)
			, Traces: TraceMenu
		};

		if(parent.args.debugEnabled)
		{
			children['Demos'] = DemoMenu;
			children['Costume'] = {
				children: {
					'Hue': {
						input: 'number'
						, min: -180
						, max: +180
						, subtext: 'Rotate the color wheel.'
						, subType: 'range'
						, revert: () => parent.customColor.h = 0
						, set: value => parent.customColor.h = Number(value).toFixed(2)
						, get: ()    => Number(parent.customColor.h).toFixed(2)
					},
					'Saturation': {
						input: 'number'
						, min:  0
						, max:  2
						, step: 0.01
						, subType: 'range'
						, subtext: 'Rotate the color wheel.'
						, revert: () => parent.customColor.s = 1
						, set: value => parent.customColor.s = Number(value).toFixed(2)
						, get: ()    => Number(parent.customColor.s).toFixed(2)
					},
					'Value': {
						input: 'number'
						, min:  0
						, max:  2
						, step: 0.01
						, subType: 'range'
						, subtext: 'Rotate the color wheel.'
						, revert: () => parent.customColor.v = 1
						, set: value => parent.customColor.v = Number(value).toFixed(2)
						, get: ()    => Number(parent.customColor.v).toFixed(2)
					}
				}
			};
		}

		return children;
	}
}}
