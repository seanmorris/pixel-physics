import { Task } from 'subspace-console/Task';
import { Tag } from 'curvature/base/Tag';

import { RtcServer } from './RtcServer';

const Accept = Symbol('accept');

export class RtcServerTask extends Task
{
	static helpText = 'RTC Server.';
	static useText  = '';

	title     = 'RTC Server Task';
	connected = false;

	init()
	{
		this.server = new RtcServer({
			iceServers: [
				{urls: 'stun:stun1.l.google.com:19302'},
				{urls: 'stun:stun2.l.google.com:19302'},
			]
		});

		this.finally(()=>{
			this.print('Terminating connection...');
			this.server.close();
		});

		this.server.addEventListener('open', () => {
			this.print('Remote peer client accepted!');
		});

		this.server.addEventListener('close', () => {
			this.print('Peer reset connection.');
		});

		this.server.addEventListener('message', event => {
			this.print(`> ${event.detail}`);
		});

		this.server.answerToken.then(token => {

			const tokenString  = JSON.stringify(token);
			const encodedToken = `s3ktp://accept/${btoa(tokenString)}`;

			this.print(`Server accept code: ${encodedToken}`);

			const answerTag = new Tag('<textarea style = "display:none">');
			answerTag.innerText = encodedToken;
			document.body.append(answerTag.node);
			answerTag.select();
			document.execCommand("copy");
			answerTag.node.remove();
		});

		this.printErr(`Please supply client's request code.`);

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

		if(!this.server.connected)
		{
			this.answer(input);
			return;
		}

		this.print(`< ${input}`);
		this.server.send(input);
	}

	answer(offerString)
	{
		const isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

		console.log(isEncoded);

		if(isEncoded)
		{
			offerString = atob(isEncoded[1]);
		}

		const offer = JSON.parse(offerString);

		this.server.answer(offer);
	}

	done()
	{

	}
}
