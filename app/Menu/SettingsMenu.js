import { GamepadConfig } from '../controller/GamepadConfig';
import { Series } from '../intro/Series';

export const SettingsMenu = (parent) => { return {
	subtext: 'Edit your configuration.'
	, children: {
		Audio: {
			subtext: 'Audio settings.'
			, children: {
				'Mute': {
					input: 'boolean'
					, subtext: 'Mute all audio'
					, set: value => parent.args.audio = !value
					, get: () => !parent.args.audio
				}
				, 'Music Volume': {
					input: 'number'
					, subtext: 'Background music volume - 0% - 100%'
					// , available: 'unavailable'
					, set: value => parent.settings.musicVol = value
					, get: () => parent.settings.musicVol
					, max: 100
					, min: 0
				}
				, 'SFX': {
					input: 'number'
					, subtext: 'Sound effect music volume - 0% - 100%'
					// , available: 'unavailable'
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

		, Video: {
			subtext: 'Video settings.'
			, children: {
				'Motion Blur Effects': {
					input: 'boolean'
					, subtext: 'Enable/Disable motion blur effects'
					, set: value => parent.settings.blur = value
					, get: () => parent.settings.blur
				}

				, 'Displacement Effects': {
					input: 'boolean'
					, subtext: 'Enable/Disable displacement effects'
					, set: value => parent.settings.displace = value
					, get: () => parent.settings.displace
				}

				, 'Outline Thickness': {
					input: 'number'
					, subtext: 'Change the outline thickness'
					, set: value => parent.settings.outline = value
					, get: () => parent.settings.outline
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
					, set: value => parent.settings.showHud = value
					, get: () => parent.settings.showHud
				}

				, 'Debug OSD': {
					input: 'boolean'
					, subtext: 'Enable/Disable debug OSD'
					, set: value => parent.settings.debugOsd = value
					, get: () => parent.settings.debugOsd
				}

				, 'FPS Meter': {
					input: 'boolean'
					, subtext: 'Enable/Disable the FPS meter'
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

		, 'Input': {

			subtext: 'Input settings.'
			, children: {

				'Gamepad Test': {
					callback: () => {
						const cards = [
							new GamepadConfig({timeout: -1}, parent)
							, ...parent.homeCards()
						];

						parent.args.titlecard = new Series({cards}, parent);

						parent.args.titlecard.play();
					}
				}

				, 'Button Select Test': {
					input: 'select'
					, options: [
						'⓿', '❶', '❷', '❸', '❹', '❺'
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
				'Username': {
					input: 'string'
					, subtext: 'Name to display in online games'
					, set: value => parent.settings.username = value
					, get: () => parent.settings.username
					, max: 15
					, min: 0
				}

				, 'Subspace Hub Servers': {}

				, 'ICE Servers': {
					children: {
						'ICE Server #1': {
							input: 'string'
							, subtext: 'ICE candidate server.'
							, available: 'unavailable'
						}
						, 'ICE Server #2': {
							input: 'string'
							, subtext: 'ICE candidate server.'
							, available: 'unavailable'
						}
						, 'ICE Server #3': {
							input: 'string'
							, subtext: 'ICE candidate server.'
							, available: 'unavailable'
						}
						, 'ICE Server #4': {
							input: 'string'
							, subtext: 'ICE candidate server.'
							, available: 'unavailable'
						}
					}
				}

			}
		}
	}
}}
