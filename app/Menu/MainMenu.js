import { Bindable } from 'curvature/base/Bindable';
import { Router }   from 'curvature/base/Router';
import { Bgm } from '../audio/Bgm';
import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';

import { Pinch } from '../effects/Pinch';
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

		if(!this.args.initialPath.length && Router.query.menuPath)
		{
			this.args.initialPath = JSON.parse(Router.query.menuPath);
		}

		this.loggingIn = null;

		this.args.cardName = 'main-menu';

		this.args.haveToken = false;

		this.args.listening = false;

		this.args.joinGame  = false;
		this.args.hostGame  = false;
		this.args.copy      = 'copy';

		this.font = 'small-menu-font';
		// this.font = 'font';

		this.args.title  = new CharacterString({font: this.font, value: 'Sonic 3000'});
		this.args.ok     = new CharacterString({font: this.font, value: '⓿ ok'});
		this.args.back   = new CharacterString({font: this.font, value: '❶ back'});
		this.args.revert = new CharacterString({font: this.font, value: '❸ default (hold)'});
		this.args.select = new CharacterString({font: this.font, value: '✚ select'});

		this.actsCleared = {};

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

		const Pallet = Bindable.make({
			input: 'select'
			, tags: 'inline'
			, options: []
			, set: value => this.parent.args.mainPallet = value
			, get: () => this.parent.args.mainPallet ?? null
		});

		Pallet.set(this.parent.args.mainPallet || 'Normal');

		const CustomColor = Bindable.make({
			Hue: {
				input: 'number'
				, tags: 'inline'
				, min: -180
				, max: +180
				, subtext: 'Rotate the color wheel.'
				, revert: () => parent.customColor.h = 0
				, set: value => parent.customColor.h = Number(value).toFixed(2)
				, get: () => parent.customColor.h
			},
			Saturation: {
				input: 'number'
				, tags: 'inline'
				, min:  0
				, max:  2
				, step: 0.01
				, subtext: 'Change the amount of color.'
				, revert: () => parent.customColor.s = 1
				, set: value => parent.customColor.s = Number(value).toFixed(2)
				, get: () => parent.customColor.s
			},
			Value: {
				input: 'number'
				, tags: 'inline'
				, min:  0
				, max:  2
				, step: 0.01
				, subtext: 'change the brightness.'
				, revert: () => parent.customColor.v = 1
				, set: value => parent.customColor.v = Number(value).toFixed(2)
				, get: () => parent.customColor.v
			}
		});

		this.onRemove(parent.args.bindTo('selectedChar', v => {
			parent.loadSaves().then(() => {

				switch(v)
				{
					case 'Sonic':
						Pallet.options = ['Normal', 'Santiago', 'Sequel', 'RedHot', 'White', 'Custom'];
						break;

					case 'Tails':
						Pallet.options = ['SkyCamo', 'Copper', 'Patina', 'Arctic', 'Custom'];
						break;

					case 'Knuckles':
						Pallet.options = ['Tails', 'Enerjak', 'Pink', 'Wechnia', 'Custom'];
						break;

					default:
						Pallet.options = [];
						break;
				}

				if(v)
				{
					const charState = parent.getCharacterState(v);

					Pallet.options.length = Pallet.options.length
						? 1 + Math.min(Pallet.options.length, Object.keys(charState.cleared).length)
						: 0;
				}
				else
				{
					Pallet.options = [];
				}

				if(Pallet.options.length)
				{
					Pallet.available = 'available';
				}
				else
				{
					Pallet.available = 'hidden';
				}
			})
		}));

		this.onRemove(parent.args.bindTo('mainPallet', v => {
			if(v === 'Custom')
			{
				CustomColor.Hue.available =
				CustomColor.Saturation.available =
				CustomColor.Value.available = 'available';
				return;
			}

			CustomColor.Hue.available =
			CustomColor.Saturation.available =
			CustomColor.Value.available = 'hidden';
		}));

		// this.parent.args.selectedChar = this.parent.args.selectedChar || 'Sonic';

		Character.prefix = new CharacterPreview(Character, this.parent);
		// Follower.prefix = new CharacterPreview(Follower);

		this.onRemove(() => Character.prefix.remove());

		this.items = this.args.items = {

			'Single Player': {

				available: 'available'

				, children: {

					Character

					// , Follower
					, Pallet
					, ...CustomColor

					, 'Brooklyn Breakout Zone Act 1': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/brooklyn-zone.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/brooklyn-zone.json'});
							this.accept();
						}
					}

					, 'Brooklyn Breakout Zone Act 2': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/brooklyn-zone-2.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/brooklyn-zone-2.json'});
							this.accept();
						}
					}

					, 'Manic Harbor Zone Act 1': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/manic-harbor-zone.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/manic-harbor-zone.json'});
							this.accept();
						}
					}

					, 'Manic Harbor Zone Act 2': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, suffix: new ZoneSuffix({map: '/map/manic-harbor-zone-2.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/manic-harbor-zone-2.json'});
							this.accept();
						}
					}

					, 'Agorapolis Zone Act 1 Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, tags: 'new'
						, suffix: new ZoneSuffix({map: '/map/emerald-isle.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/emerald-isle.json'});
							this.accept();
						}
					}

					, 'Agorapolis Zone Act 2 Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, tags: 'new'
						, suffix: new ZoneSuffix({map: '/map/emerald-isle-2.json'}, this.parent)
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/emerald-isle-2.json'});
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

					, 'Misty Ruins Zone Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art, layout and physics for Misty Ruins Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/ruins-test.json'});
							this.accept();
						}
					}

					, 'StratoRail Zone Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art for Moon Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/pumpkin-test.json'});
							this.accept();
						}
					}

					, 'Toxin Refinery Zone Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, tags: 'new'
						, subtext: 'Testing art for Moon Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/chemical-test.json'});
							this.accept();
						}
					}

					, 'Underground Zone Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art, layout and physics for Underground Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/underground-test.json'});
							this.accept();
						}
					}

					// , 'Peak Vape Test Zone': {
					// 	characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
					// 	, subtext: 'Testing art for Peak Vape Zone'
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/quartz-test.json'});
					// 		this.accept();
					// 	}
					// }

					, 'Moon Zone Preview': {
						characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
						, subtext: 'Testing art for Moon Zone'
						, callback: () => {
							this.parent.loadMap({mapUrl: '/map/moon-test.json'});
							this.accept();
						}
					}

					// , 'Flickie Test': {
					// 	characters: ['Sonic', 'Tails', 'Knuckles', 'Robotnik']
					// 	, subtext: 'Flickie stress test'
					// 	, callback: () => {
					// 		this.parent.loadMap({mapUrl: '/map/flickie-test.json'});
					// 		this.accept();
					// 	}
					// }
				}
			}

			, 'Multiplayer': {
				tags: ''
				, children: {
					'Matrix Lobby': {
						tags: 'new'
						, callback: () => {
							this.refreshConnection();
							if(!this.loggingIn)
							{
								this.loggingIn = this.parent.matrixConnect(true);
								this.loggingIn.finally(() => this.loggingIn = null);
								this.loggingIn.then(matrix => {
									const lobby = new Lobby({roomId:this.parent.settings.matrixRoom},this.parent);
									this.args.override = lobby;
									this.args.override.onRemove(() => {
										this.args.override = null;
										this.onNextFrame(()=>this.focusFirst());
									});
									this.onRemove(() => lobby.remove());
								});
							}
							else
							{
								this.parent.matrixConnect();
							}
						}
					}

					, 'Peer to Peer': {

						children: {
							'Host a game': {
								callback: () => {
									this.refreshConnection();
									this.args.hostOutput = '';
									this.args.hostGame   = true;
									this.args.copy       = 'copy';
								}
							}

							, 'Join a game': {
								callback: () => {
									this.refreshConnection();
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
				, tags: 'inline'
				, options: ['High', 'Medium', 'Low', 'Very Low']
				, set: value => parent.settings.graphicsLevel = value
				, get: ()    => parent.settings.graphicsLevel
			}

			, About: {
				callback: () => {
					window.open('/about.html');
				}
			}
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

		// if(this.args.pinch)
		// {
		// 	const xAxis = (controller.axes[xEffect] ? controller.axes[xEffect].magnitude : 0) + (controller.axes[0] ? controller.axes[0].magnitude : 0) * 0.1;
		// 	const yAxis = (controller.axes[yEffect] ? controller.axes[yEffect].magnitude : 0) + (controller.axes[1] ? controller.axes[1].magnitude : 0) * 0.1;

		// 	this.args.pinch.args.dx = 64*1.618 * xAxis;
		// 	this.args.pinch.args.dy = 64*1.000 * yAxis;
		// }
	}

	disconnect()
	{
		this.server && this.server.close();
		this.client && this.client.close();

		this.server = null;
		this.client = null;

		this.parent.args.networked = false;
		this.parent.args.chatBox = null;

		this.args.connected = false;
		this.args.hostGame  = false;
		this.args.joinGame  = false;

		this.clear();
	}

	// onRendered(event)
	// {
	// 	super.onRendered(event);

	// 	this.args.twist = new Twist({
	// 		id:'menu-twist', scale:  64, width: Math.floor(64 * 1.618), height: 64
	// 	});

	// 	this.args.pinch = new Pinch({
	// 		id:'menu-pinch', scale:  64, width: Math.floor(64 * 1.618), height: 64
	// 	});
	// }

	back(levels = 1)
	{
		super.back(levels);

		this.disconnect();
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
			console.log('Peer connection opened!')
			this.parent
			.loadMap({mapUrl: '/map/emerald-isle.json', networked: true})
			.then(() => console.log('Level started!'));
		};

		const onClose = event => {

			this.disconnect(event);

			if(this.server && this.server.peerServer && this.server.peerServer.connectionState === 'closed')
			{
				console.log({server:this.server});
				this.server = null;
			}

			if(this.client && this.client.peerClient && this.client.peerClient.connectionState === 'closed')
			{
				console.log({client:this.client});
				this.client = null;
			}
		};

		this.listen(server, 'open',  onOpen,  {once:true});
		this.listen(client, 'open',  onOpen,  {once:true});
		this.listen(server, 'close', onClose, {once:true});
		this.listen(client, 'close', onClose, {once:true});
	}

	play()
	{
		super.play();

		Bgm.play('MENU_THEME', {loop:true, interlude: true});

		const done = this.done;

		done.then(() => this.onTimeout(250, () => this.remove()));

		return done;
	}
}
