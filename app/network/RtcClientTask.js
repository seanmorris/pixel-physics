import { Task } from 'subspace-console/Task';
import { Tag } from 'curvature/base/Tag';

import { RtcClient } from './RtcClient';

const Accept = Symbol('accept');

export class RtcClientTask extends Task
{
	static helpText = 'RTC Client.';
	static useText  = '';

	title     = 'RTC Client Task';
	connected = false;

	init()
	{
		this.client = new RtcClient({
			iceServers: [
			// 	{urls: 'stun:stun1.l.google.com:19302'},
			// 	{urls: 'stun:stun2.l.google.com:19302'}
			]
		});

		this.finally(()=> {
			console.log('Terminating connection...');
			this.client.close();
		});

		this.client.addEventListener('open', () => {
			this.print('Remote peer client accepted!');
		});

		this.client.addEventListener('close', () => {
			this.print('Peer reset connection.');
		});

		this.client.addEventListener('message', event => {
			this.print(`> ${event.detail}`);
		});

		this.client.offerToken.then(token => {
			this.print('Client Offer');

			const tokenString  = JSON.stringify(token);
			const encodedToken = `s3ktp://request/${btoa(tokenString)}`;

			this.print(encodedToken);

			const offerTag = new Tag('<textarea style = "display:none">');

			offerTag.innerText = encodedToken;

			document.body.append(offerTag.node);

			offerTag.select();

			document.execCommand("copy");

			offerTag.node.remove();
		});

		return new Promise(accept => {
			this[Accept] = accept;
		});
	}

	main(input)
	{
		if(!input)
		{
			return;
		}

		if(!this.client.connected)
		{
			this.accept(input);
			return;
		}

		this.print(`< ${input}`);
		this.client.send(input);
	}

	accept(answerString)
	{
		if(!answerString)
		{
			this.print(`Please supply SDP answer string.`);

			return;
		}

		const isEncoded = /^s3ktp:\/\/accept\/(.+)/.exec(answerString);

		console.log(isEncoded);

		if(isEncoded)
		{
			answerString = atob(isEncoded[1]);
		}

		const answer = JSON.parse(answerString);

		this.client.accept(answer);
	}
}



