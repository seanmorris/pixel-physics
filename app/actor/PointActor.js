import { View } from 'curvature/base/View';

export class PointActor extends View
{
	template = `<div class = "point-actor" style = "--x:[[x]];--y:[[y]];"></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 256 + 1022;
		this.args.y = this.args.y || 256;

		this.args.xSpeed = 1;
		this.args.ySpeed = 10;

		this.args.xSpeedRun = 10;
	}

	update()
	{
		const map = this.viewport.tileMap;

		const downDistance = this.downRay(this.args.ySpeed, (i, point) => {

			const tile    = map.coordsToTile(...point);
			const tileNo  = map.getTileNumber(...tile);

			if(!tileNo)
			{
				return;
			}

			if(map.getSolid(tileNo, ...point))
			{
				this.args.y += i;

				return i;
			}
		});

		if(downDistance === false)
		{
			this.args.y += this.args.ySpeed;
		}
	}

	downRay(...args)
	{
		let length   = 1;
		let callback = () => {};
		let angle    = Math.PI / 2;
		let offset   = [0,1];

		switch(args.length)
		{
			case 2:
				[length, callback] = args;
				break;
			case 3:
				[length, angle, callback] = args;
				break;
			case 4:
				[length, angle, offset, callback] = args;
				break;
		}

		let hit = false;

		for(let i = 0; i <= length; i++)
		{
			const bottom  = [
				this.x + offset[0] + (i * Math.sin(angle))
				, this.y + offset[1] + (i * Math.sin(angle))
			];

			const retVal = callback(i, bottom);

			if(retVal !== undefined)
			{
				return retVal;
			}
		}

		return false;
	}

	goLeft()
	{
		this.args.x -= !this.running ? this.args.xSpeed : this.args.xSpeedRun;
	}

	goRight()
	{
		this.args.x += !this.running ? this.args.xSpeed : this.args.xSpeedRun;
	}

	goUp()
	{
		this.args.y -= this.args.ySpeed+1;
		// this.args.y--;
	}

	goDown()
	{
		this.args.y++;
	}

	get x() { return this.args.x }
	get y() { return this.args.y }
}
