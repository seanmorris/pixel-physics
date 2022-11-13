import { Cursor } from './Cursor';

export class MouseIndicator extends Cursor
{
	endPoint = null;

	onRendered(event)
	{
		super.onRendered(event);

		this.autoStyle.get(this.box)['--magnitude'] = 'magnitude';
	}

	update()
	{
		const mouse = this.viewport.mouse;

		if(!mouse.buttons[0] && !this.endPoint)
		{
			this.args.x = mouse.position[0];
			this.args.y = mouse.position[1];
		}
		else if(mouse.buttons[0] && this.endPoint)
		{
			this.viewport.actors.remove(this.endPoint);
			this.endPoint = null;
		}
		else
		{
			if(!this.endPoint)
			{
				this.endPoint = new Cursor({x:this.args.x,y:this.args.y});
				this.viewport.spawn.add({object:this.endPoint});
			}

			const length = Math.sqrt(
				(this.args.y - mouse.position[1]) ** 2
				+ (this.args.x - mouse.position[0]) ** 2
			);

			const angle = Math.atan2(
				mouse.position[1] - this.args.y
				, mouse.position[0] - this.args.x
			);

			this.args.airAngle = angle;

			this.args.falling = false;
			const magnitude = this.castRayQuick(length, angle);
			this.args.falling = true;

			this.endPoint.args.x = this.args.x + Math.cos(angle) * magnitude;
			this.endPoint.args.y = this.args.y + Math.sin(angle) * magnitude;
		}
	};
}
