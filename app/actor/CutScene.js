import { PointActor } from './PointActor';

export class CutScene extends PointActor
{
	constructor(args = {}, parent)
	{
		super(args, parent);

		if(args.src)
		{
			this.fetcher = fetch(args.src).then(r => r.json());
		}
		else if(args.frames)
		{
			this.fetcher = Promise.resolve(args.frames);
		}

		this.args.hidden = true;
	}

	playSample(event)
	{
		const viewport = this.viewport;

		if(!viewport.args.audio)
		{
			return;
		}

		const tag = new Audio(event.source);

		tag.play();
	}

	activate(other, button, force = false)
	{
		if(!other.controllable || (other.args.falling && !force))
		{
			return;
		}

		if(!button && other.args.canonical !== 'Sonic')
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

		this.fetcher.then(scene => {

			let timer = 0;

			for(const frame of scene)
			{
				const frameCallback = () => {

					switch(frame.event)
					{
						case 'dialog':
							viewport.showDialog(frame.lines, frame.classes);
							break;

						case 'audio':
							this.playSample(frame);
							break;

						case 'face':
							other.args.direction = frame.direction;
							other.args.facing    = frame.direction > 0 ? 'right' : 'left';
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

						case 'superdrop':
							other.dropDashCharge = 30;
							break;

						case 'clearAct':
							viewport.clearAct(frame.message);
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

				if(timer)
				{
					viewport.onFrameOut(timer, frameCallback);
				}
				else
				{
					frameCallback();
				}

				timer += (frame.time || 0);
			}
		});
	}
}
