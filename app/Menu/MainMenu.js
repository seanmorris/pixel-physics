import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';
import { Droop } from '../effects/Droop';

import { Menu } from './Menu';

import { SettingsMenu } from './SettingsMenu';

export class MainMenu extends Menu
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.cardName = 'main-menu';

		this.args.haveToken = false;

		this.args.joinGame  = false;
		this.args.hostGame  = false;
		this.args.copy      = 'copy';

		this.refreshConnection();

		this.args.items = {

			'Single Player': { available: 'available', callback: () => {
				this.parent.args.networked = false;
				this.remove()
			} }

			, Settings: SettingsMenu(parent)

			, 'Direct Connect': {

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

							this.client.offer().then(token => {
								const tokenString    = JSON.stringify(token);
								const encodedToken   = `s3ktp://request/${btoa(tokenString)}`;
								this.args.joinOutput = encodedToken;
								this.args.haveToken  = true;
							});
						}
					}

				}
			}
			, 'Connect To Server': {

				available: 'unavailable'
			}
		};


		this.bgm = new Audio('/Sonic/s3k-competition.mp3');

		this.bgm.volume = 0.5;

		this.onRemove(() => this.bgm.pause());

		this.bgm.loop = true;
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

		if(this.args.warp)
		{
			const xAxis = (controller.axes[2] ? controller.axes[2].magnitude : 0)
			const yAxis = (controller.axes[3] ? controller.axes[3].magnitude : 0)

			this.args.warp.args.intensity = 1 - Math.abs(xAxis ** 2);
			this.args.warp.args.scale     = 128 * ( 0 + xAxis);

			this.args.warp.args.dx = 64*1.618 * xAxis;

			// this.args.warp.args.intensity = 0.5 * ( 1 + (controller.axes[3] ? controller.axes[3].magnitude : 0));
		}
	}

	disconnect()
	{
		this.clear();

		if(this.args.hostGame)
		{
			this.server.close();
		}
		else if(this.args.joinGame)
		{
			this.client.close();
		}

		this.args.connected = false;
		this.args.hostGame  = false;
		this.args.joinGame  = false;

		this.refreshConnection();
	}

	onRendered()
	{
		const debind = this.parent.args.bindTo('audio', (v) => {
			v ? this.onTimeout(500, () => this.bgm.play()) : this.bgm.pause();
		});

		super.onRendered(event);

		this.onRemove(debind);

		this.args.warp = new Droop({
			id:'menu-warp', scale:  64, width: Math.floor(64 * 1.618), height: 64
		});
	}

	back()
	{
		super.back();

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

		const answer = this.server.answer(offer);

		answer.then(token => {
			const tokenString    = JSON.stringify(token);
			const encodedToken   = `s3ktp://accept/${btoa(tokenString)}`;
			this.args.hostOutput = encodedToken;
			this.args.haveToken  = true;
		});

		return answer;
	}

	accept()
	{
		let answerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);

		if(isEncoded)
		{
			answerString = atob(isEncoded[1]);
		}

		const answer = JSON.parse(answerString);

		this.client.accept(answer);
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
				this.accept();
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
			this.parent.args.networked = true;
			this.remove();
		};
		const onClose = event => this.disconnect();

		this.listen(server, 'open', onOpen);
		this.listen(server, 'close', onClose);

		this.listen(client, 'open', onOpen);
		this.listen(client, 'close', onClose);
	}
}
