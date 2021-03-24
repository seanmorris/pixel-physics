import { Card } from '../intro/Card';

import { Cylinder } from '../effects/Cylinder';
import { Pinch } from '../effects/Pinch';

import { RtcClient } from '../network/RtcClient';
import { RtcServer } from '../network/RtcServer';

// import { ElasticOut } from 'curvature/animate/ease/ElasticOut';

export class MainMenu extends Card
{
	template = require('./main-menu.html');

	constructor(args,parent)
	{
		super(args,parent);

		this.args.haveToken = false;
		this.args.joinGame  = false;
		this.args.hostGame  = false;

		this.args.outputLines = [];

		this.args.cardName = 'main-menu';

		const unavailable = 'unavailable';

		this.args.items = {
			'Single Player': {
				available: 'available'
				, callback: () => this.remove()
			}
			, 'Direct Connect': {

				children: {

					'Host a game': {

						callback: () => {

							this.server = new RtcServer;

							this.server.addEventListener('open', () => {
								this.args.connected = true;
							});

							this.server.addEventListener('close', () => {
								this.args.connected = false;
							});

							this.server.addEventListener('message', event => {
								this.args.outputLines.push(`> ${event.detail}`);

								this.onNextFrame(() => {
									this.tags.chatOutput.scrollTo(0, this.tags.chatOutput.scrollHeight);
								});
							});

							this.args.hostGame = true;

							this.server.answerToken.then(token => {

								const tokenString    = JSON.stringify(token);
								const encodedToken   = `s3ktp://accept/${btoa(tokenString)}`;
								this.args.haveToken  = true;
								this.args.hostOutput = encodedToken;

								console.log(`Server Anwser code: ${encodedToken}`);
							});
						}

					}

					, 'Join a game': {

						callback: () => {

							this.client = new RtcClient;

							this.client.addEventListener('open', () => {
								this.args.connected = true;
							});

							this.client.addEventListener('close', () => {
								this.args.connected = false;
							});

							this.client.addEventListener('message', event => {
								this.args.outputLines.push(`> ${event.detail}`);

								this.onNextFrame(() => {
									this.tags.chatOutput.scrollTo(0, this.tags.chatOutput.scrollHeight);
								});
							});

							this.client.offerToken.then(token => {

								const tokenString    = JSON.stringify(token);
								const encodedToken   = `s3ktp://request/${btoa(tokenString)}`;
								this.args.joinOutput = encodedToken;
								this.args.joinGame   = true;
								this.args.haveToken  = true;

								console.log(`Client request code: ${encodedToken}`);
							});
						}

					}
				}
			}
			, 'Connect To Server': { available: 'unavailable' }
		};

		this.currentItem = null;

		this.selector = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';

		this.onRemove(() => parent.focus());

		this.bgm = new Audio('/Sonic/s3k-competition.mp3');

		this.bgm.volume = 0.5;

		this.onRemove(() => this.bgm.pause());

		this.bgm.loop = true;
	}

	onRendered()
	{
		const debind = this.parent.args.bindTo('audio', (v) => {
			v ? this.onTimeout(500, () => this.bgm.play()) : this.bgm.pause();
		});

		this.onRemove(debind);

		if(!this.tags.bound)
		{
			return;
		}

		const bounds = this.tags.bound;

		const elements = [...bounds.querySelectorAll(this.selector)];

		this.listen(elements, 'focus', event => this.currentItem = event.target);

		this.listen(elements, 'blur', event => event.target.classList.remove('focused'));

		this.args.warp = new Pinch({
			id:'menu-warp'
			, scale:  64
		});
	}

	onAttached()
	{
		const next = this.findNext(this.currentItem, this.tags.bound.node);

		if(next)
		{
			this.focus(next);
		}
	}

	findNext(current, bounds, reverse = false)
	{
		const elements = bounds.querySelectorAll(this.selector);

		if(!elements.length)
		{
			return;
		}

		let found = false;
		let first = null;
		let last  = null;

		for(const element of elements)
		{
			if(!first)
			{
				if(!current && !reverse)
				{
					return element;
				}

				first = element;
			}

			if(!reverse && found)
			{
				return element;
			}

			if(element === current)
			{
				if(reverse && last)
				{
					return last;
				}

				found = true;
			}

			last = element;
		}

		if(reverse)
		{
			return last;
		}

		return this.findNext(undefined, bounds, reverse);
	}

	focus(element)
	{
		if(element)
		{
			element.classList.add('focused');
			element.focus();
		}

		if(this.currentItem && this.currentItem !== element)
		{
			this.blur(this.currentItem);
		}

		this.currentItem = element;
	}

	blur(element)
	{
		element.classList.remove('focused');
		element.blur();
	}

	input(controller)
	{
		if(!this.tags.bound)
		{
			return;
		}

		this.args.warp.args.dx = (controller.axes[2] ? controller.axes[2].magnitude : 0) * 32;
		this.args.warp.args.dy = (controller.axes[3] ? controller.axes[3].magnitude : 0) * 32;

		let next;

		if(controller.buttons[12] && controller.buttons[12].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node, true);

		}
		else if(controller.buttons[13] && controller.buttons[13].time === 1)
		{
			next = this.findNext(this.currentItem, this.tags.bound.node);

			this.focus(next);
		}
		else if(controller.buttons[14] && controller.buttons[14].time === 1)
		{
			this.args.last = 'LEFT';
		}
		else if(controller.buttons[15] && controller.buttons[15].time === 1)
		{
			this.args.last = 'RIGHT';
		}

		if(controller.buttons[0] && controller.buttons[0].time === 1)
		{
			this.currentItem && this.currentItem.click()

			this.args.last = 'A';
		}
		else if(controller.buttons[1] && controller.buttons[1].time === 1)
		{
			this.args.last = 'B';
		}

		next && this.onNextFrame(()=> this.focus(next));
	}

	run(item)
	{
		item.callback && item.callback();

		if(item.children)
		{
			const prev = this.args.items;
			const back = {callback: () => this.args.items = prev};

			this.args.items = item.children;

			this.args.items['back'] = this.args.items['back'] || back;
		}
	}

	answer()
	{
		let offerString = this.args.input;

		const isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

		console.log(isEncoded);

		if(isEncoded)
		{
			offerString = atob(isEncoded[1]);
		}

		const offer = JSON.parse(offerString);

		this.server.answer(offer);
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
			this.tags.hostOutput.select();
		}
		else if(this.args.joinGame)
		{
			this.tags.joinOutput.select();
		}

		document.execCommand("copy");
	}

	send(event)
	{
		if(event && event.key !== 'Enter')
		{
			return;
		}

		const message = this.args.chatInput;

		if(!message || !this.args.connected)
		{
			return;
		}

		this.args.outputLines.push(`< ${message}`);

		this.args.chatInput = '';

		this.onNextFrame(() => {
			this.tags.chatOutput.scrollTo(0, this.tags.chatOutput.scrollHeight);
			this.tags.chatInput.focus();
		});

		if(this.args.hostGame)
		{
			this.server.send(message);
		}
		else if(this.args.joinGame)
		{
			this.client.send(message);
		}
	}
}
