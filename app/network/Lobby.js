import { View } from 'curvature/base/View';

export class Lobby extends View
{
	template = require('./lobby.html');

	constructor(args,parent)
	{
		super(args, parent);

		this.args.messages = Array(10).fill(0).map((v,k) => `Message ${k}`);
		this.args.users    = Array(10).fill(0).map((v,k) => `User ${k}`);

		this.args.input = 'message...';
	}

	clickInput(event)
	{
		this.tags.input.focus();
	}
}
