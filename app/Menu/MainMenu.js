import { Router }   from 'curvature/base/Router';
import { Bgm } from '../audio/Bgm';
import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';

import { Pinch } from '../effects/Pinch';
import { Droop } from '../effects/Droop';
import { Twist } from '../effects/Twist';

import { Menu } from './Menu';

import { SavestateMenu } from './SavestateMenu';
import { SettingsMenu } from './SettingsMenu';

import { TileMap }  from '../tileMap/TileMap';

import { CharacterString } from '../ui/CharacterString';
import { CharacterPreview } from './CharacterPreview';
import { ZoneSuffix } from './ZoneSuffix';

import { Lobby } from '../network/Lobby';

export class MainMenu extends Menu
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		if(Router.query.menuPath)
		{
			this.args.initialPath = JSON.parse(Router.query.menuPath);
		}

		this.args.cardName = 'main-menu';

		this.args.haveToken = false;

		this.args.joinGame  = false;
		this.args.hostGame  = false;
		this.args.copy      = 'copy';

		this.font = 'small-menu-font';
		// this.font = 'font';

		this.args.title = new CharacterString({
			value:  'Sonic 3000'
			, font: this.font
		});

		this.args.ok = new CharacterString({
			value:  '⓿ ok'
			, font: this.font
		});

		this.args.back = new CharacterString({
			value:  '❶ back'
			, font: this.font
		});

		this.args.back = new CharacterString({
			value:  '❸ default (hold)'
			, font: this.font
		});

		this.args.select = new CharacterString({
			value:  '✚ select'
			, font: this.font
		});

		this.refreshConnection();

		const Character = {
			input: 'select'
			, options: [
				'Sonic'
				, 'Tails'
				, 'Knuckles'
				, 'Robotnik'
				, 'EggRobo'
				, 'Mecha-Sonic'
				, 'Seymour'
				, 'Chalmers'
				, 'Sean'
			]
			, locked: [
				'Robotnik'
				, 'EggRobo'
				, 'Mecha-Sonic'
				, 'Seymour'
				, 'Chalmers'
				, 'Sean'
			]
			, default: 'Sonic'
			, set: value => this.parent.args.selectedChar = value
			, get: () => this.parent.args.selectedChar ?? 'Sonic'
		};

		const Follower = {
			input: 'select'
			, options: [
				'Sonic'
				, 'Tails'
				, 'Knuckles'
				// , 'Robotnik'
				// , 'EggRobo'
				// , 'Mecha-Sonic'
				// , 'Seymour'
				// , 'Chalmers'
				// , 'Sean'
			]
			, locked: [
				'Robotnik'
				, 'EggRobo'
				, 'Mecha-Sonic'
				, 'Seymour'
				, 'Chalmers'
				, 'Sean'
			]
			, set: value => this.parent.args.followerChar = value
			, get: () => this.parent.args.followerChar ?? 'Tails'
		};

		Character.prefix = new CharacterPreview(Character);
		// Follower.prefix = new CharacterPreview(Follower);

		this.items = this.args.items = {

			'Single Player': {

				available: 'available'

				, children: {

					Character

					// , Follower

					, 'Sonic Control Tutorial': {
						subtext: 'Learn the controls for Sonic'
						, characters: ['Sonic']
						, callback: () => {
							this.parent.loadMap({mapUrl:'/map/sonic-movement.json'});
							this.accept();
						}
					}

					, 'Tails Control Tutorial': {
						subtext: 'Learn the controls for Tails'
						, characters: ['Tails']
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/tails-movement.json'});
							this.accept();
						}
					}

					, 'Knuckles Control Tutorial': {
						subtext: 'Learn the controls for Knuckles'
						, characters: ['Knuckles']
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/knuckles-movement.json'});
							this.accept();
						}
					}

					, 'Radical City Zone Act 1': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/empty-zone.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl:'/map/empty-zone.json'});
							this.accept();
						}
					}

					, 'Radical City Zone Act 2': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/empty-zone-2.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl:'/map/empty-zone-2.json'});
							this.accept();
						}
					}

					, 'Seaview Park Zone Act 1': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/west-side-zone.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl:'/map/west-side-zone.json'});
							this.accept();
						}
					}

					, 'Seaview Park Zone Act 2': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/west-side-zone-2.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl:'/map/west-side-zone-2.json'});
							this.accept();
						}
					}

					, 'Manic Harbor Test Zone': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art, layout and physics for Manic Harbor Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/manic-harbor-zone.json'});
							this.accept();
						}
					}

					, 'Misty Ruins Test Zone': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art, layout and physics for Misty Ruins Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/ruins-test.json'});
							this.accept();
						}
					}

					, 'Underground Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art, layout and physics for Underground Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/underground-test.json'});
							this.accept();
						}
					}

					, 'Moon Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art for Moon Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/moon-test.json'});
							this.accept();
						}
					}

					, 'Terrain Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing different terrain types'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/bendy-bridges.json'});
							this.accept();
						}
					}

					// , 'Pixel Hill Zone': {
					// 	characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
					// 	, subtext: 'Movement Sandbox - all characters'
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/pixel-hill-zone.json'});
					// 		this.accept();
					// 	}
					// }

					, 'Space Pinball Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing pinball physics'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/pinball-test.json'});
							this.accept();
						}
					}
					, 'Belt and Wheel Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing elastic and rotational physics'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/belt-test.json'});
							this.accept();
						}
					}
					, 'See-Saw Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing see-saw physics'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/see-saw-test.json'});
							this.accept();
						}
					}

					, 'Vehicle Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing vehicles'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/vehicle-test.json'});
							this.accept();
						}
					}

					, 'Spotlight Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing spotlight effects'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/visor-test.json'});
							this.accept();
						}
					}

					, 'Flickie Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Flickie stress test'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/flickie-test.json'});
							this.accept();
						}
					}

					// , 'Light Dash Test': {
					// 	characters: ['Sonic']
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/light-dash-test.json'});
					// 		this.accept();
					// 	}
					// }

					, 'Block Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/block-test.json'});
							this.accept();
						}
					}

					// , 'Half Pipe Test': {
					// 	characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/half-pipe-test.json'});
					// 		this.accept();
					// 	}
					// }

					// , 'Water Test': {
					// 	characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/water-test.json'});
					// 		this.accept();
					// 	}
					// }

					, 'Arch Test': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/arc-test.json'});
							this.accept();
						}
					}
				}
			}

			, 'Multiplayer': {
				children: {
					'Matrix Lobby': {
						callback: () => {
							this.parent.matrixConnect().then(matrix => {
								this.args.override = new Lobby({},this.parent);
								this.args.override.onRemove(() => {
									this.args.override = null;
									this.onNextFrame(()=>this.focusFirst());
								});
							});
						}
					}

					, 'Peer to Peer': {

						children: {
							'Host a game': {
								callback: () => {
									this.args.hostOutput = '';
									this.args.hostGame   = true;
									this.args.copy       = 'copy';
								}
							}

							, 'Join a game': {
								callback: () => {
									this.args.joinOutput = '';
									this.args.joinGame   = true;
									this.args.copy       = 'copy';

									this.client.fullOffer().then(token => {
										const tokenString    = JSON.stringify(token);
										const encodedToken   = `s3ktp://request/${btoa(tokenString)}`;
										this.args.joinOutput = encodedToken;
										this.args.haveToken  = true;
									});
								}
							}
						}
					}
				}
			}


			, Settings: SettingsMenu(parent)

			, Graphics: {
				input: 'select'
				, options: ['High', 'Medium', 'Low', 'Very Low']
				, set: value => parent.settings.graphicsLevel = value
				, get: ()    => parent.settings.graphicsLevel
			}

			// , 'Connect To Server': { available: 'unavailable' }
			// , Load: SavestateMenu(parent)

			, About: {
				callback: () => {
					window.open('/about.html');
				}
			}

			// , 'Back': { callback: () => parent.quit(true) }
		};
	}

	clear()
	{
		this.args.input      = '';
		this.args.joinOutput = '';
		this.args.hostOutput = '';
	}

	input(controller)
	{
		super.input(controller);

		let xEffect = 2;
		let yEffect = 3;

		// if(controller.axes[7])
		// {
		// 	xEffect = 3;
		// 	yEffect = 4;
		// }

		// if(this.args.twist)
		// {
		// 	const xAxis = (controller.axes[xEffect] ? controller.axes[xEffect].magnitude : 0);
		// 	const yAxis = (controller.axes[yEffect] ? controller.axes[yEffect].magnitude : 0);

		// 	let pressure = 0;

		// 	if(controller.buttons[6])
		// 	{
		// 		pressure = controller.buttons[6].pressure - controller.buttons[7].pressure;
		// 	}

		// 	this.args.twist.args.scale = pressure * -256;

		// 	this.args.twist.args.dx = 64*1.618 * xAxis;
		// 	this.args.twist.args.dy = 64*1.000 * yAxis;
		// }

		if(this.args.pinch)
		{
			const xAxis = (controller.axes[xEffect] ? controller.axes[xEffect].magnitude : 0) + (controller.axes[0] ? controller.axes[0].magnitude : 0) * 0.1;
			const yAxis = (controller.axes[yEffect] ? controller.axes[yEffect].magnitude : 0) + (controller.axes[1] ? controller.axes[1].magnitude : 0) * 0.1;

			this.args.pinch.args.dx = 64*1.618 * xAxis;
			this.args.pinch.args.dy = 64*1.000 * yAxis;
		}
	}

	disconnect()
	{
		this.server.close();
		this.client.close();

		this.parent.args.networked = false;
		this.parent.args.chatBox = null;

		this.args.connected = false;
		this.args.hostGame  = false;
		this.args.joinGame  = false;

		this.clear();

		this.refreshConnection();
	}

	onRendered(event)
	{
		super.onRendered(event);

		// this.args.twist = new Twist({
		// 	id:'menu-twist', scale:  64, width: Math.floor(64 * 1.618), height: 64
		// });

		this.args.pinch = new Pinch({
			id:'menu-pinch', scale:  64, width: Math.floor(64 * 1.618), height: 64
		});
	}

	back()
	{
		super.back();

		this.disconnect();
	}

	focus(element)
	{
		super.focus(element);

		element.scrollIntoView({behavior: 'smooth', block: 'center'});
	}

	answer()
	{
		let offerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

		if(isEncoded)
		{
			offerString = atob(isEncoded[1]);
		}

		const offer = JSON.parse(offerString);

		const answer = this.server.fullAnswer(offer);

		answer.then(token => {
			const tokenString    = JSON.stringify(token);
			const encodedToken   = `s3ktp://accept/${btoa(tokenString)}`;
			this.args.hostOutput = encodedToken;
			this.args.haveToken  = true;
		});

		return answer;
	}

	acceptRtp()
	{
		let answerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);

		if(isEncoded)
		{
			answerString = atob(isEncoded[1]);
		}

		const answer = JSON.parse(answerString);

		this.client.fullAccept(answer);
	}

	select()
	{
		if(this.args.hostGame)
		{
			this.tags.hostOutput.select();
		}
		else if(this.args.joinGame)
		{
			this.tags.joinOutput.select();
		}
	}

	copy()
	{
		if(this.args.hostGame)
		{
			if(!this.args.input)
			{
				return;
			}

			this.tags.hostOutput.select();
		}
		else if(this.args.joinGame)
		{
			if(!this.args.joinOutput)
			{
				return;
			}

			this.tags.joinOutput.select();
		}

		document.execCommand("copy");

		this.args.copy = 'copied!';
	}

	paste(event)
	{
		navigator.clipboard.readText().then(copied => {
			if(this.args.hostGame && copied.match(/^s3ktp:\/\/request\//))
			{
				this.args.input = copied;

				this.answer().then(token => {
					this.copy();
				});
			}

			if(this.args.joinGame && copied.match(/^s3ktp:\/\/accept\//))
			{
				this.args.input = copied;
				this.acceptRtp();
			}
		});
	}

	refreshConnection()
	{
		this.server = this.parent.getServer(true);
		this.client = this.parent.getClient(true);

		const server = this.server;
		const client = this.client;

		const onOpen  = event => {
			this.parent
			.loadMap({mapUrl: '/map/manic-harbor-zone.json', networked: true})
			.then(() => console.log('Peer connection opened!'));
		};
		const onClose = event => {
			this.disconnect(event);
			this.parent.quit(2);
		};

		this.listen(server, 'open', onOpen);
		this.listen(server, 'close', onClose);

		this.listen(client, 'open', onOpen);
		this.listen(client, 'close', onClose);
	}

	play()
	{
		super.play();

		Bgm.play('MENU_THEME', true);

		const done = this.done;

		done.then(() => this.onTimeout(250, () => this.remove()));

		return done;
	}
}
