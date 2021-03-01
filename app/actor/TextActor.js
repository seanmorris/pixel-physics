import { PointActor } from './PointActor';
import { CharacterString } from '../ui/CharacterString';

export class TextActor extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.type  = 'actor-item actor-text-actor';

		this.args.float = -1;

		this.text = new CharacterString({value:''});

		this.args.bindTo('content', v => this.text.args.value = v);
	}

	onAttached()
	{
		this.sprite = this.findTag('div.sprite');

		this.text.render(this.sprite);
	}

	get solid() { return false; }
}
