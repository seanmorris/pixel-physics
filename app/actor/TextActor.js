import { PointActor } from './PointActor';
import { CharacterString } from '../ui/CharacterString';

export class TextActor extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-text-actor';

		this.args.float  = -1;
	}

	onAttached()
	{
		this.sprite = this.findTag('div.sprite');

		this.text = new CharacterString({value:'Click a character to select.'});

		this.text.render(this.sprite);
	}

	get solid() { return false; }
	get isEffect() { return true; }
}
