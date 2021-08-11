import { PointActor } from './PointActor';

export class Cinematic extends PointActor
{
	noClip = true;
	panSpeed = 9;

	constructor(args, parent)
	{
		super(args, parent);

		this.args.float = -1;

		this.target = null;

		this.targets = [
			[250, 6500]
			, [5900, 6600]
			, [250, 6500]
			, [7700, 7800]
			, [6800, 4200]
			, [6800, 4200]
			, [8000, 4300]
			, [1450, 1800]
		];
	}

	setCameraMode()
	{
		this.args.cameraMode = 'cinematic';
	}

	update()
	{
		super.update();

		if(!this.args.selected)
		{
			return;
		}

		if(!this.target || (this.x === this.target[0] && this.y === this.target[1]))
		{
			if(!this.targets.length)
			{
				this.remove();
			}

			this.target = this.targets.shift();

			return;
		}

		const target = this.target;

		if(this.x !== target[0])
		{
			const space = target[0] - this.x;

			this.args.x += Math.sign(space) * this.panSpeed;

			if(Math.abs(space) < this.panSpeed)
			{
				this.args.x = target[0];
			}
		}

		if(this.y !== target[1])
		{
			const space = target[1] - this.y;

			this.args.y += Math.sign(space) * this.panSpeed;

			if(Math.abs(space) < this.panSpeed)
			{
				this.args.y = target[1];
			}
		}
	}

	get isGhost() { return true; };
	get controllable() { return true; };
}
