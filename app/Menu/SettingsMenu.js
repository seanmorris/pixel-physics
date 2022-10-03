import { GamepadConfig } from '../controller/GamepadConfig';
import { Series } from '../intro/Series';

import { ButtonSelect } from './ButtonSelect';

export const SettingsMenu = (parent) => { return {
	subtext: 'Edit your configuration.'
	, children: {
		Video: {
			subtext: 'Video settings.'
			, children: {
				'Motion Blur Effects': {
					input: 'boolean'
					, subtext: 'Enable/Disable Motion Blur Effects'
					, set: value => parent.settings.blur = value
					, get: () => parent.settings.blur
				}

				, 'Displacement Effects': {
					input: 'boolean'
					, subtext: 'Enable/Disable Displacement Effects'
					, set: value => parent.settings.displace = value
					, get: () => parent.settings.displace
				}

				, 'Scaling': {
					input: 'boolean'
					, subtext: 'Enable/Disable Scaling'
					, set: value => parent.settings.scaling = value
					, get: () => parent.settings.scaling
				}

				, 'Smoothing': {
					input: 'boolean'
					, subtext: 'Enable/Disable Smoothing'
					, set: value => parent.settings.smoothing = value
					, get: () => parent.settings.smoothing
				}

				// , 'Outline Thickness': {
				// 	input: 'number'
				// 	, subtext: 'Change the Outline Thickness'
				// 	, set: value => parent.settings.outline = value
				// 	, get: () => parent.settings.outline
				// 	, max: 15
				// 	, min: 0
				// }

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
					, set: value => parent.settings.showFps = value
					, get: () => parent.settings.showFps
				}

				, 'Mute/Fullscreen': {
					input: 'boolean'
					, subtext: 'Show the mute & fullscreen controls in the bottom right.'
					, set: value => parent.settings.shortcuts = value
					, get: () => parent.settings.shortcuts
				}
			}
		}

		, Audio: {
			subtext: 'Audio settings.'
			, children: {
				'Mute': {
					input: 'boolean'
					, subtext: 'Mute all audio'
					, revert: () => parent.settings.audio = parent.defaults.audio
					, set: value => parent.args.audio = !value
					, get: () => !parent.args.audio
				}
				, 'Music Volume': {
					input: 'number'
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
		}

		, 'Input': {
			subtext: 'Input settings.'
			, children: {
				'Gamepad Test': {
					callback: (item,menu) => {
						menu.args.override = new GamepadConfig({}, parent);
						menu.args.override.onRemove(() => {
							menu.args.override = null;
							menu.onNextFrame(()=>menu.focusFirst());
						});
						// const cards = [
						// 	new GamepadConfig({timeout: -1}, parent)
						// 	, ...parent.homeCards()
						// ];

						// parent.args.titlecard = new Series({cards}, parent);

						// parent.args.titlecard.play();
					}
				}

				, 'Select A Button': {
					callback: (item,menu) => {
						console.log('Select a button!');
						menu.args.override = new ButtonSelect({},menu);
						menu.args.override.onRemove(() => {
							menu.args.override = null;
							menu.onNextFrame(()=>menu.focusFirst());
						});
					}
				}

				, 'Output test': {
					input: 'output'
					, bind: i => {
						return parent.settings.bindTo('buttonTest', v => {
							i.setting = v
						})
					}
					, set: value => parent.settings.buttonTest = value
					, get: () => parent.settings.buttonTest
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
		}


		, Network: {
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
		}
	}
}}
