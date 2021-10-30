import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

export class HtmlFrame extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;
		obj.args.tileId = objDef.gid;

		// obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.args.yForce = 0;
		this.args.yLean  = 0;

		this.args.type = 'actor-item actor-html-frame';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.z = -1000;

		this.args.static = true;

		this.args.gravity = 0.5;

		this.args.collapse = args.collapse ?? false;

		this.args.url = 'https://www.youtube.com/embed/pxIofYrt0kE?controls=0&autoplay=1';
	}

	onRendered(event)
	{
		super.onRendered(event);

		this.droop(0);

		if(this.screen)
		{
			return;
		}

		this.screen = new Tag(`<iframe width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
		this.sprite.appendChild(this.screen.node);

		this.screen.style({'pointer-events':'initial'});

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';

		this.args.bindTo('url', v => this.screen.src = v);
		this.args.bindTo('html', v => this.screen.srcDoc = v);
	}
}

// <iframe width="560" height="315" src="https://www.youtube.com/embed/lTsIO_bo2P8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
