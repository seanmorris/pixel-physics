import { PointActor } from './PointActor';

export class Switch extends PointActor
{
	constructor(...args)
	{
		super(...args);

		this.args.type = 'actor-item actor-switch';

		this.args.width  = 32;
		this.args.height = this.height = 16;

		// this.args.float  = -1;

		this.removeTimer = null;

		this.args.active = false;
		this.args.latch  = this.args.latch || false;

		this.activator = null;

		this.args.bindTo('active', v => {
			this.box && this.box.setAttribute('data-active', v ? 'true' : 'false');
		});

		this.args.threshold = this.args.threshold ?? 100;

		this.ignore = 0;
	}

	update()
	{
		super.update();

		if(this.args.active)
		{
			this.args.height = this.height + -6;
		}
		else
		{
			this.args.height = this.height;
		}

		if(this.ignore > 0)
		{
			this.ignore--;
			return;
		}

		if(this.args.latch)
		{
			return;
		}

		if(!this.activator
			|| this.activator.args.standingOn !== this
			|| this.activator.y === this.args.y
		){
			this.args.active = false;
			this.activator   = null;
		}
	}

	onAttached()
	{
		this.box = this.findTag('div');

		this.sample = new Audio('/Sonic/switch-activated.wav');
	}

	collideA(other, type)
	{
		if(this.activator === other && other.y > this.y)
		{
			this.ignore = 8;
			return true;
		}

		if(other.args.ySpeed < 0)
		{
			if(other.args.ySpeed === 0 && other.y > this.y)
			{
				return true;
			}

			return false;
		}

		if(this.args.active && other.y < this.y)
		{
			return true;
		}

		if(other.isEffect || other.isRegion)
		{
			return;
		}

		if(other.y > this.y - this.args.height + 0)
		{
			return false;
		}

		if(this.args.threshold && other.args.weight < this.args.threshold)
		{
			return true;
		}


		other.onRemove(()=> this.activator = null);

		if(other.y <= this.y - this.args.height)
		{
			if(!this.args.active)
			{
				this.activate(other);
			}

			this.ignore = 8;

			this.args.active = true;

			this.activator = other;

			// if(type === 1 || type === 3)
			// {
			// 	return false;
			// }

			return true;
		}

		return false;
	}

	activate(other)
	{
		this.beep();

		if(this.args.target && this.viewport.actorsById[ this.args.target ])
		{
			const target = this.viewport.actorsById[ this.args.target ];

			target.activate(other, this);
		}

		if(this.args.destroyLayer)
		{
			const layerId = this.args.destroyLayer;
			const layer   = this.viewport.args.layers[ layerId ];

			if(layer)
			{
				layer.args.destroyed = true;
			}
		}

		if(this.args.water)
		{
			const water = this.viewport.actorsById[ this.args.water ];
			const level = this.viewport.objDefs.get( this.args.setPoint );

			water.target = Number(water.y || 0) - Number(level.y || 0);

			water.args.fillSpeed  = this.args.fillSpeed  ?? water.args.fillSpeed;
			water.args.drainSpeed = this.args.drainSpeed ?? water.args.drainSpeed;
		}

		const spawnPoint = this.viewport.objDefs.get(this.args.point);
		const spawnType  = this.viewport.objectPalette[ this.args.spawn ];

		if(spawnType && spawnPoint)
		{
			this.viewport.spawn.add({object: new spawnType({x:spawnPoint.x,y:spawnPoint.y})});
		}

		this.args.active = true;
	}

	beep()
	{
		if(!this.viewport)
		{
			return;
		}

		if(this.args.silent)
		{
			return;
		}

		if(this.viewport.args.audio && this.sample)
		{
			this.sample.play();
		}
	}

	sleep()
	{
		if(!this.viewport)
		{
			return;
		}

		this.args.x = this.def.get('x');
		this.args.y = this.def.get('y');

		this.onNextFrame(() => {
			this.args.x = this.def.get('x');
			this.args.y = this.def.get('y');

			this.viewport.setColCell(this);

			this.args.xSpeed = 0;
			this.args.ySpeed = 0;
			this.args.pushed = 0;
			this.args.float  = 0;
		});
	}

	get solid() { return true; }
}
