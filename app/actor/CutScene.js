import { PointActor } from './PointActor';

export class CutScene extends PointActor
{
	constructor(args, parent)
	{
		super(args, parent);

		this.fetcher = fetch('/cutscenes/knuckles-intro.json');

		this.args.hidden = true;
	}

	activate(other, button)
	{
		if(!other.controllable || other.args.falling)
		{
			return;
		}

		const viewport = this.viewport;

		if(!viewport || this.args.running)
		{
			return;
		}

		this.args.running = true;

		other.args.gSpeed = 0;

		viewport.args.cutScene = true;

		other.controller.zero();

		this.fetcher.then(r => r.json()).then(scene => {

			let timer = 0;

			for(const frame of scene)
			{
				const frameCallback = () => {

					switch(frame.event)
					{
						case 'dialog':
							viewport.showDialog(frame.lines, frame.classes)
							break;

						case 'input':

							if(frame.axes)
							{
								other.controller.replay({axes: frame.axes});
							}

							if(frame.buttons)
							{
								other.controller.replay({buttons: frame.buttons});
							}

							other.readInput();

							break;

						case 'clear':
							viewport.clearDialog()
							break;


						case 'message':
							viewport.showCenterMessage(frame.message)
							break;

						case 'hide':
							viewport.hideCenterMessage();
							viewport.hideDialog();
							break

						case 'wait':
							viewport.args.cutScene = false;
							viewport.hideCenterMessage();
							viewport.hideDialog();
							break;
					}
				};

				if(frame.time)
				{
					viewport.onFrameOut(timer, frameCallback);
				}
				else
				{
					frameCallback();
				}

				timer += frame.time;
			}
		});
	}
}
