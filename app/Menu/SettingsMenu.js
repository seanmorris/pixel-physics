export const SettingsMenu = (parent) => { return {
	children: {
		Video: {
			children: {
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
			}
		}

		, Network: {
			children: {
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

		, Audio: {
			children: {
				'Music Volume': {
					input: 'number'
					, subtext: 'Background music volume - 0% - 100%'
					, available: 'unavailable'
					, set: value => parent.settings.musicVol = value
					, get: () => parent.settings.musicVol
					, max: 100
					, min: 0
				}
				, 'SFX': {
					input: 'number'
					, subtext: 'Sound effect music volume - 0% - 100%'
					, available: 'unavailable'
					, set: value => parent.settings.sfxVol = value
					, get: () => parent.settings.sfxVol
					, max: 100
					, min: 0
				}
				, 'Mono / Stereo': {
					available: 'unavailable'
				}
			}
		}

	}
}}
