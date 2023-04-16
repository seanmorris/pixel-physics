import { Cursor } from './Cursor';
import { CharacterString } from '../ui/CharacterString';

export class MouseIndicator extends Cursor
{
	endPoint = null;

	lastMouseX = null;
	lastMouseY = null;

	onRendered(event)
	{
		super.onRendered(event);

		this.args.type = 'point-actor actor-generic actor-mouse-indicator'

		this.autoStyle.get(this.box)['--magnitude'] = 'magnitude';

		this.magnitudeLabel = new CharacterString({value: 0});
		this.angleLabel     = new CharacterString({value: 0});
		this.colorLabel     = new CharacterString({value: 0});

		Object.assign(this.args.charStrings, [this.magnitudeLabel, this.angleLabel, this.colorLabel]);
	}

	update()
	{
		const mouse = this.viewport.mouse;

		if(!mouse.buttons[0] && !this.endPoint)
		{
			this.args.x = mouse.position[0];
			this.args.y = mouse.position[1];
		}
		else if(mouse.buttons[0] === 1 && this.endPoint)
		{
			// this.viewport.actors.remove(this.endPoint);
			this.endPoint = null;
		}
		else if(mouse.buttons[0] === 1 && !this.endPoint)
		{
			this.endPoint = new Cursor({x:this.args.x,y:this.args.y});
			// this.viewport.spawn.add({object:this.endPoint});
		}
		else
		{
			const length = Math.hypot(
				this.args.y - mouse.position[1]
				, this.args.x - mouse.position[0]
			);

			const angle = Math.atan2(
				mouse.position[1] - this.args.y
				, mouse.position[0] - this.args.x
			);

			this.args.airAngle = angle;

			// this.args.falling = false;

			if(this.lastMouseX !== mouse.position[0] || this.lastMouseY !== mouse.position[1])
			{
				// this.viewport.args.plot.clearPoints();
				window.logPoints = (x,y,label) => this.viewport.args.plot.addPoint(x,y,'main-scan '+label);
				const magnitude = this.castRayQuick(length, angle);
				window.logPoints = false;

				this.args.falling = true;

				this.endPoint.args.x = this.args.x + Math.cos(angle) * magnitude;
				this.endPoint.args.y = this.args.y + Math.sin(angle) * magnitude;

				const color = this.viewport.tileMap.getColor(
					Math.trunc(this.endPoint.args.x)
					, Math.trunc(this.endPoint.args.y)
					, 0
				);

				this.magnitudeLabel.args.value = magnitude === false ? false : Number(magnitude).toFixed(2);
				this.angleLabel.args.value     = Number(angle).toFixed(2);
				this.colorLabel.args.value     = Number(color).toString(16).padStart(8, '0');
			}

			this.lastMouseX = mouse.position[0];
			this.lastMouseY = mouse.position[1];
		}
	};
}
