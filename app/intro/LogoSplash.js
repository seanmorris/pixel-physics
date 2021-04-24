import { View } from 'curvature/base/View';

export class LogoSplash extends View
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		this.ringSample = new Audio('/Sonic/ring-collect.wav');

		this.ringSample.volume = 0.50;

		this.template   = `<div class = "splash [[animation]]" style = "
			pointer-events: [[pointerEvents]]
		">
			<div class = "center">SEAN<span class = "min">MORRIS</span><div class = "sm">SM</div></div>
			<div class = "center">SEAN<span class = "min">MORRIS</span><div class = "sm">SM</div></div>
			<div class = "center">SEAN<span class = "min">MORRIS</span><div class = "sm">SM</div></div>
		</div>`;

	}

	onAttached()
	{
		if(this.alreadyAttached)
		{
			return;
		}

		this.alreadyAttached = true;

		this.args.left  = 0;
		this.args.right = 0;
		this.args.fade  = 1;

		this.args.frame = 0;
		this.args.fullFade = 1;

		this.args.pointerEvents = 'all';

		this.args.animation = 'hide';

		this.onTimeout(500,  ()=> this.args.animation = 'slide');
		this.onTimeout(1250, ()=> this.args.animation = 'show');
		this.onTimeout(5000, ()=> this.args.animation = 'done');

		this.onTimeout(1250, ()=> this.parent.args.audio && this.ringSample.play());
	}
}
