import { View } from 'curvature/base/View';

export class PointActor extends View
{
	template = `<div class = "point-actor" style = "--x:[[x]];--y:[[y]];"></div>`;

	constructor(...args)
	{
		super(...args);

		this.args.x = this.args.x || 256 + 1022;
		this.args.y = this.args.y || 1500;

		this.args.xSpeed = 1;
		this.args.ySpeed = 10;

		this.args.xSpeedRun = 10;
	}

	update()
	{
		const map = this.viewport.tileMap;

		let hit = false;


		for(let i = 0	; i <= this.args.ySpeed; i++)
		{
			const bottom  = [ this.x, 1 + this.y + i];

			const tile    = map.coordsToTile(...bottom);
			const tileNo  = map.getTileNumber(...tile);

			if(!tileNo)
			{
				continue;
			}

			if(map.getSolid(tileNo, ...bottom))
			{
				hit = true;

				this.args.y += i;

				break;
			}
		}

		if(!hit)
		{
			this.args.y += this.args.ySpeed;
		}
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
