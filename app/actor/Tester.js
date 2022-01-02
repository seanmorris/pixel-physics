import { PointActor } from './PointActor';
import { Cursor } from './Cursor';
import { ObjectPalette } from '../ObjectPalette';

window.testRuns = [];

export class Tester extends PointActor
{
	count = 0;
	char = null;

	update()
	{
		if(!this.char)
		{
			const charType = ObjectPalette['sonic'];
			const count = this.count;

			this.char = new charType({
				name: `Test #${count}`
				, x: this.x + -(count % 160) + +80
				, y: this.y
			});

			// this.char.cursor = new Cursor;

			const debind = this.char.args.bindTo(
				'falling'
				, () => {
					const landed = this.char.x;
					this.viewport.onFrameOut(5, ()=>{console.log({
						count
						, landed
						, groundAngle: this.char.args.groundAngle
						, gSpeed: this.char.args.gSpeed
					})});
					debind();
				}
				, {now: false, frame: 1}
			);

			window.testRuns[count] = this.char;

			this.count++;

			this.viewport.spawn.add({object: this.char});
			// this.viewport.spawn.add({object: this.char.cursor});
		}
		else
		{
			const controller = this.char.controller;

			const press = 4;

			if(this.char.age === 5)
			{
				controller.press(press, 1);
			}

			if(this.char.age === 6)
			{
				controller.press(press, 0);
			}

			this.char.readInput();
		}

		if(this.char.args.dead)
		{
			const dead = this.char;

			this.char = null;

			// this.viewport.actors.remove(dead.cursor)

			// dead.cursor.remove();

			this.viewport.onFrameOut(100, () => this.viewport.actors.remove(dead));
		}
		else if(this.char.age > 30)
		{
			this.char.xAxis = +1;
		}
	}

	updateEnd()
	{
		if(this.char)
		{
			// this.char.cursor.args.x        = this.char.x;
			// this.char.cursor.args.y        = this.char.y;

			// this.char.cursor.args.angle    = this.char.angle;
			// this.char.cursor.args.airAngle = this.char.airAngle;

			// this.char.cursor.args.groundAngle = this.char.groundAngle;
		}
	}
}
