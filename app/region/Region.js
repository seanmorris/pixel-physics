import { PointActor } from '../actor/PointActor';

export class Region extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		obj.args.x = obj.originalX = -0 + Math.floor(objDef.x / 32) * 32;
		obj.args.y = obj.originalY = -0 + Math.floor(objDef.y / 32) * 32;

		return obj;
	}

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region';

		this.args.width  = this.public.width  || 32;
		this.args.height = this.public.height || 32;

		this.args.density = 1;
		this.args.gravity = 1;
		this.args.drag    = 1;

		this.skimSpeed = Infinity;

		this.args.float = -1;
	}

	update()
	{
		super.update();

		const topBoundry  = -this.viewport.args.y - (this.y - this.args.height);
		const leftBoundry = -16 + -this.viewport.args.x - this.x;

		this.tags.sprite && this.tags.sprite.style({
			'--viewportWidth':    this.viewport.args.width  + 'px'
			, '--viewportHeight': this.viewport.args.height + 'px'
			, '--leftBoundry':    leftBoundry + 'px'
			, '--topBoundry':     topBoundry + 'px'
		});
	}

	updateActor(other)
	{

	}

	get solid() { return false; }
	get isEffect() { return true; }
}
