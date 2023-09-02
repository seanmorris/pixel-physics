import { PointActor } from './PointActor';

import { Tag } from 'curvature/base/Tag';

import { Ring } from './Ring';
import { LayerSwitch } from './LayerSwitch';
import { GrapplePoint } from './GrapplePoint';

import { QuintInOut } from 'curvature/animate/ease/QuintInOut';
import { CubicInOut } from 'curvature/animate/ease/CubicInOut';

import { Platformer } from '../behavior/Platformer';

export class Block extends PointActor
{
	static fromDef(objDef)
	{
		const obj = super.fromDef(objDef);

		obj.args.width  = objDef.width;
		obj.args.height = objDef.height;

		// obj.args.x = obj.originalX = objDef.x + Math.floor(objDef.width / 2);
		obj.args.y = obj.originalY = objDef.y;

		return obj;
	}

	constructor(args = {}, parent)
	{
		super(args, parent);

		this.hitBlocks = false;

		this.args.yForce = 0;
		this.args.yLean  = 0;

		this.args.z = this.args.z ?? 100;

		this.args.type = 'actor-item actor-block';

		this.args.width  = args.width  || 32;
		this.args.height = args.height || 32;
		this.args.convey = args.convey ?? 0;

		this.args.conveyed = 0;

		this.args.ySpeedMax = 32;

		this.originalX = this.args.x;
		this.originalY = this.args.y;

		this.args.solid = this.args.solid ?? true;

		this.args.gravity = 0.4;

		this.args.collapse = args.collapse ?? false;
		this.args.drop     = args.drop     ?? false;

		this.args.active = -1;

		this.weighted = false;

		this.activatedAt = null;

		this.originalModes = new Map;
		this.watching = new Set;

		if(this.args.master)
		{
			this.childBlocks = new Set;
		}

		// this.args.bindTo('spriteSheet', v => console.trace(v));
	}

	onRendered(event)
	{
		super.onRendered(event);

		if(!this.viewport)
		{
			return;
		}

		if(this.args.match)
		{
			this.match = this.viewport.actorsById[ this.args.match ];
		}

		// if(this.screen)
		// {
		// 	return;
		// }

		// this.screen = new Tag(`<input type = "text" placeholder = "this effect is dynamic">`);
		// this.screen2 = new Tag(`<input tabindex = "0" type = "button" value = "submit">`);

		// this.sprite.appendChild(this.screen.node);
		// this.sprite.appendChild(this.screen2.node);

		// this.screen.style({'pointer-events':'initial', 'z-index': 1000});

		// if(!this.viewport)
		// {
		// 	event.preventDefault();
		// 	return false;
		// }

		this.args.spriteSheet = this.args.spriteSheet || '/Sonic/marble-zone-block.png';

		if(this.args.droop)
		{
			this.droop(0);
		}

		this.args.collapse && this.tags.sprite.classList.add('collapse');
		this.args.platform && this.tags.sprite.classList.add('platform');
		this.args.drop     && this.tags.sprite.classList.add('drop');

		if(this.args.hidden)
		{
			event && event.preventDefault();

			return false;
		}

		this.setTile();
	}

	initialize()
	{
		if(!this.otherDefs.path && !this.otherDefs.ridePath)
		{
			return;
		}

		this.pathReset();
	}

	pathReset()
	{
		if(this.args.master)
		{
			const path = this.otherDefs.path || this.otherDefs.ridePath;

			if(path)
			{
				this.pathNext = path;
				this.args.x = path.x;
				this.args.y = path.y;

				this.viewport.setColCell(this);

				for(const child of this.childBlocks)
				{
					const path = child.otherDefs.path || child.otherDefs.ridePath;

					child.pathNext = path;
					child.args.x = path.x;
					child.args.y = path.y;

					this.viewport.setColCell(child);
				}
			}
		}
		else if(this.others.childOf)
		{
			this.others.childOf.pathReset();
		}
	}

	wakeUp()
	{
		this.sleeping = false;

		if(this.otherDefs.path)
		{
			if(this.others.childOf)
			{
				this.others.childOf.childBlocks.add(this);
			}
		}

		this.pathReset();

		this.setTile();

		this.noClip = false;

		if(!this.args.tiedTo)
		{
			return;
		}

		if(!this.args._tiedTo)
		{
			this.args._tiedTo = this.viewport.actorsById[ this.args.tiedTo ];
		}

		const _tiedTo = this.args._tiedTo;

		if(_tiedTo && !_tiedTo.hanging.has(this.constructor))
		{
			_tiedTo.hanging.set(this.constructor, new Set);
			const hangList = _tiedTo.hanging.get(this.constructor);
			hangList.add(this);

			this.chain = new Tag('<div class = "chain">');
			this.sprite.appendChild(this.chain.node);
			this.onRemove(() => hangList.delete(this));
		}
	}

	collideA(other, type)
	{
		if(other instanceof LayerSwitch)
		{
			return;
		}

		if(other instanceof GrapplePoint && this.args.platform)
		{
			return;
		}

		if(other instanceof this.constructor && !other.args.falling && !other.hitBlocks)
		{
			return false;
		}

		if(other.isRegion || other.noClip || other.args.static)
		{
			return false;
		}

		if(other.args.standingOn === this)
		{
			this.weighted = true;
		}

		if(this.objDef && this.args.platform && this.objDef.type === 'hex-nut' && other.objDef && other.objDef.type === 'hex-nut')
		{
			return false;
		}

		let xDist  = 0.5 + (other.x - this.x) / this.args.width;

		if(other.args.gSpeed < 0)
		{
			xDist = -xDist + 1;
		}

		if(other.args.mode)
		{
			xDist = -xDist + 1;
		}

		if(this.args.hSwap
			&& other.groundTime > 2
			&& Math.abs(other.args.gSpeed) > 8
			&& xDist < 0.2
		){
			this.watching.add(other);

			if(!this.originalModes.has(other))
			{
				this.originalModes.set(other, {
					mode: other.args.mode
					, rolling: other.args.rolling
					, gSpeed: other.args.gSpeed
				});
			}

			if(this.originalModes.has(other))
			{
				other.args.gSpeed = this.originalModes.get(other).gSpeed;
			}
		}

		if(((!other.args.falling && !other.args.climbing) || (other.args.climbing && other.y < this.y - this.args.height))
			&& this.args.droop
			&& other.args.ySpeed >= 0
			&& other.args.standingOn !== this
		){
			return true;
		}

		if(!other.args.climbing && this.args.droop && other.controllable && (type === 0 || type === 2) && other.args.ySpeed >= 0)
		{
			const blockTop = this.originalY + -this.args.height;
			const half     = Math.floor(this.args.width / 2);
			const speed    = other.args.gSpeed;
			const absSpeed = Math.abs(speed);

			if(absSpeed > half)
			{
				this.args.y      = this.originalY;
				other.args.y     = blockTop + -1;
				this.args.yForce = 0;
				this.args.yLean  = 0;

				return true;
			}

			const pos    = ((this.x + -other.x + -(speed * 2)) / half);
			const droop  = Number(this.args.droop) * 0.9;
			const absPos = Math.abs(pos);

			// this.screen.placeholder = `drooping at ${pos.toFixed(2)}`;

			if(absPos >= 0.9)
			{
				this.args.yForce = 0;
				this.args.yLean = (this.args.yLean / 100);

				return true;
			}

			const yForceMax = Math.round(droop * (1 - Math.abs(pos)) / 2);

			this.args.yForce += Math.max(other.ySpeedLast, 0);
			this.args.yForce  = Math.min(yForceMax, this.args.yForce);
			this.args.yForce  = Math.max(this.args.yForce, -yForceMax);

			this.droopPos = (this.x - other.x);

			// if(this.args.output)
			// {
			// 	const output = this.viewport.actorsById[ this.args.output ];

			// 	if(output)
			// 	{
			// 		output.args.content = this.screen.value;
			// 	}
			// }
		}

		// if(!other.args.bouncing && (type === 0 || type === -1) && !this.args.platform && other.controllable && other.args.ySpeed)
		// {
		// 	// other.args.y = other.yLast;
		// 	if(other.args.y < this.args.y)
		// 	{
		// 		other.args.y = this.y + -this.args.height;
		// 		other.args.falling = false;
		// 		other.args.ySpeed = this.args.ySpeed;
		// 	}

		// 	return;
		// }

		if(this.args.platform && !other.args.dead && !(other instanceof Ring))
		{
			const otherTop  = other.args.y - other.args.height;
			const blockTop  = this.args.y - this.args.height;
			const halfWidth = this.args.width / 2;

			if(other.args.falling
				&& Math.abs(other.args.y - blockTop) < 4
				&& other.args.ySpeed >= 0
				&& !other.args.float
				&& (!other.args.dashed || other.args.ySpeed > other.args.xSpeed)
			){
				if(other.controllable || other.args.npc)
				{
					other.args.y = -1 + blockTop;
				}
				else
				{
					other.args.y = blockTop;
				}
			}

			if((other.args.y <= blockTop) && (other.args.falling === false || other.args.ySpeed > 0))
			{
				return true;
			}

			if(other.args.falling === false && other.args.mode === 2)
			{
				return true;
			}

			if(other.args.npc && !other.args.falling && this.args.falling && !this.args.float)
			{
				other.startle();
				other.noClip = true;
			}

			return false;
		}

		if(!other.controllable && !other.isVehicle)
		{
			return true;
		}

		if(!this.switch && this.args.drop && (type === 0 || type === 2) && this.args.float <= 0)
		{
			this.args.float = 1;
			this.args.goBack = false;
		}

		if(!this.switch && this.args.collapse && (type === 0 || type === 2) && this.args.float <= 0)
		{
			if(other.args.ySpeed > 15)
			{
				this.args.float = 1;

				this.args.goBack = false;

				const ySpeed = other.args.ySpeed;

				this.onNextFrame(()=>{
					if(this.args.falling || this.args.float)
					{
						this.args.ySpeed = ySpeed;
						this.args.float  = 1;
					}
					else
					{
						this.args.ySpeed = -1;
						this.args.float  = 1;
					}

					this.args.falling = true;

				});
			}
			else if(other.args.ySpeed > 0 || other.args.gSpeed)
			{
				this.args.float = this.args.float >= 0 ? this.args.float : (this.args.delay || 0);
			}

			this.viewport.onFrameOut(1, () => this.args.falling = true);
		}

		return true;
	}

	activate()
	{
		this.args.active = true;
	}

	deactivate()
	{
		this.args.active = false;
	}

	update()
	{
		if(this.others.childOf)
		{
			return;
		}
		else if(this.args.master)
		{
			for(const child of this.childBlocks)
			{
				child._update();
			}
		}

		return this._update();
	}

	_update()
	{
		if(!this.viewport)
		{
			return;
		}

		const frameId = this.viewport.args.frameId - this.viewport.args.startFrameId;

		if(this.args.active > 0)
		{
			if(!this.activatedAt)
			{
				this.activatedAt = frameId;
			}
		}

		if(this.args.switch && !this.switch)
		{
			this.switch = this.viewport.actorsById[ this.args.switch ];
		}

		if(this.args.static)
		{
			super.update();
			return;
		}

		if(this.args.collapse)
		{
			this.args.gSpeed = 0;

			if((!this.switch && (this.activatedAt && frameId - this.activatedAt > 25)) || (this.switch && this.switch.args.active))
			{
				this.args.float = this.args.float >= 0 ? this.args.float : (this.args.delay || 0);

				if(!this.args.float)
				{
					this.args.ySpeed = this.args.ySpeed || 12;
				}
			}
		}

		if(this.args.drop)
		{
			this.args.gSpeed = 0;

			if((!this.switch && (this.activatedAt && frameId - this.activatedAt > 25)) || (this.switch && this.switch.args.active))
			{
				this.args.float  = this.args.float >= 0 ? this.args.float : (this.args.delay || 0);

				this.noClip = true;

				this.args.active = false;

				this.args.falling = true;
			}
		}

		if(this.match)
		{
			this.args.convey = -this.match.args.convey;
		}

		this.xLast = this.args.x;
		this.yLast = this.args.y;

		if(this.otherDefs.path)
		{
			let next = this.pathNext || this.otherDefs.path;

			if(next)
			{
				for(const prop of next.properties)
				{
					if(prop.name === 'next')
					{
						next = this.viewport.objDefs.get(prop.value);
					}
				}

				const speed = this.args.pathSpeed ?? 8;

				const xDiff = this.args.x - next.x;
				const yDiff = this.args.y - next.y;

				const angle = Math.atan2(yDiff, xDiff);

				if(Math.abs(xDiff) < speed && Math.abs(yDiff) < speed)
				{
					this.pathNext = next;
				}

				if(Math.abs(xDiff) < speed)
				{
					this.args.x = next.x;
				}
				else
				{
					this.args.x -= speed * Math.cos(angle);
				}

				if(Math.abs(yDiff) < speed)
				{
					this.args.y = next.y;
				}
				else
				{
					this.args.y -= speed * Math.sin(angle);
				}
			}
		}



		if(this.args.float && (this.args.oscillateX && this.args.oscillateY))
		{
			const timeFrame = frameId + (this.args.offset ?? 0) * Math.PI;

			{
				const current = Math.sin(timeFrame/this.args.timeX);
				const moveX = (current * this.args.oscillateX);
				this.args.x = this.originalX - moveX;
			}

			{
				const current = Math.cos(timeFrame/this.args.timeY);
				const moveY = -(current * this.args.oscillateY);
				this.args.y = this.originalY - moveY;
			}
		}
		else if(this.args.float && (this.args.oscillateX || this.args.oscillateY))
		{
			const current = Math.cos(Math.sin(frameId/90)**5)**(5*3.333);

			if(this.args.oscillateX)
			{
				const moveX = Math.round(current * this.args.oscillateX);

				this.args.x = this.originalX - moveX;
			}

			if(this.args.oscillateY)
			{
				const moveY = Math.round(current * this.args.oscillateY);

				this.args.y = this.originalY - moveY;
			}
		}

		if(!this.switch && this.args.collapse)
		{
			// if(!this.reset && !this.args.once)
			// {
			// 	this.reset = true;

			// 	this.viewport.onFrameOut(300, () => {
			// 		this.args.groundAngle = 0;
			// 		this.args.falling = true;
			// 		this.args.goBack = true;
			// 		this.args.float = -1;
			// 		this.reset = false;
			// 	});
			// }

			// if(!this.args.worm && this.args.goBack)
			// {
			// 	this.args.float = -1;

			// 	this.noClip = true;

			// 	const distX = this.originalX - this.args.x;
			// 	const distY = this.originalY - this.args.y;

			// 	this.args.xSpeed = 0;
			// 	this.args.ySpeed = 0;
			// 	this.args.gSpeed = 0;

			// 	if(Math.abs(distX) > 3)
			// 	{
			// 		this.args.x += Math.sign(distX) * 3;
			// 	}
			// 	else
			// 	{
			// 		this.args.x	= this.originalX;
			// 	}

			// 	if(Math.abs(distY) > 3)
			// 	{
			// 		this.args.y += Math.sign(distY) * 3;
			// 	}
			// 	else
			// 	{
			// 		this.args.y	= this.originalY;
			// 	}

			// 	if(this.args.x === this.originalX && this.args.y === this.originalY)
			// 	{
			// 		this.args.goBack = false;
			// 		this.noClip = false;
			// 	}

			// 	this.args.groundAngle = 0;
			// 	this.args.airAngle = 0;
			// }
		}
		else if(this.args.droop)
		{
			this.snapBack = this.snapBack || false;

			if(!this.args.colliding && this.args.yForce && this.viewport)
			{
				this.viewport.onFrameOut(4, () => {
					if(!this.viewport)
					{
						return;
					}

					const colliding = this.viewport.collisions.has(this);
					const collisions = colliding ? [...this.viewport.collisions.get(this).keys()] : [];

					if(!colliding || !collisions.filter(a => a.controllable).length)
					{
						this.snapBack = true;
					}
				});
			}

			if(!this.args.colliding && this.args.yForce && this.snapBack)
			{
				this.args.yForce *= 0.15;
			}

			if(Math.abs(this.args.yForce) <= 1)
			{
				// this.screen.placeholder = `flat.`;
				this.snapBack = false;
			}

			if(this.args.yForce !== this.args.yLean)
			{
				const diff = this.args.yLean - this.args.yForce;
				const step = this.args.yForce > this.args.yLean
					? Math.abs(diff) * 0.666
					: Math.abs(diff) * 0.333;

				this.args.yLean -= Math.sign(diff) * step;

				if(Math.abs(diff) < step)
				{
					this.args.yLean = this.args.yForce;
				}
			}

			if(!this.args.yLean)
			{
				this.args.y = this.originalY;
			}
			else
			{
				this.args.y = Math.ceil(this.originalY + this.args.yLean) || this.originalY;
				this.droop(-1 * this.args.yLean, this.droopPos || 0);
				// this.onNextFrame(() => {
				// 	this.args.y = Math.ceil(this.originalY + this.args.yLean) || this.originalY;
				// 	this.droop(-1 * this.args.yLean, this.droopPos || 0);
				// });
			}
		}

		this.box && this.box.style({'--convey':Math.abs(this.args.convey)});
		this.box && this.box.style({'--conveyDir':Math.sign(this.args.conveyed)});

		this.args.conveyed += this.args.convey;

		this.box && this.box.style({'--conveyed': this.args.conveyed*0.8});
		this.box && this.box.setAttribute('data-design', this.args.design);

		const _tiedTo = this.args._tiedTo;

		if(_tiedTo && this.chain)
		{
			const point = {x:this.args.x, y:this.args.y - this.args.height};
			this.chain.style({
				'--distance': _tiedTo.distanceFrom(point) + this.args.height
				, '--angle':  _tiedTo.angleTo(point) + (Math.PI/2)
			});
		}

		super.update();

	}

	updateStart()
	{
		if(this.args.float && this.args.settle)
		{
			if(this.weighted && this.args.y < this.def.get('y') + this.args.settle)
			{
				this.args.y += Math.min(Math.abs(this.args.settle), 64) / 8 * Math.sign(this.args.settle);
			}

			if(!this.weighted && this.y > this.def.get('y'))
			{
				this.args.y -= Math.min(Math.abs(this.args.settle), 32) / 8 * Math.sign(this.args.settle);
			}
		}

		this.weighted = false;

		for(const other of this.watching)
		{
			const {mode, rolling, gSpeed} = this.originalModes.get(other);

			let xDist  = 0.5 + (other.x - this.x) / this.args.width;

			const direction = Math.sign(gSpeed);

			if(direction < 0)
			{
				xDist = -xDist + 1;
			}

			if(mode)
			{
				xDist = -xDist + 1;
			}

			const xMoved = other.args.x - other.xLast;

			if(xDist >= 1)
			{
				this.originalModes.delete(other);
				this.watching.delete(other);
				other.noClip = false;
			}

			if(xDist >= 0.75)
			{
				other.args.xSpeed = xMoved;
				other.args.float = 0;
				other.args.falling = false;
				other.args.rolling = rolling;

				other.args.ignore = 9;
				// other.xAxis = Math.sign(other.args.gSpeed);

				if(mode === 0)
				{
					other.args.gSpeed = -gSpeed;
					other.args.y = this.args.y + 1;
					other.args.mode = 2;
					other.args.facing = Math.sign(gSpeed) < 0 ? 'right' : 'left';
				}

				if(mode === 2)
				{
					other.args.gSpeed = -gSpeed;
					other.args.y = this.args.y + -this.args.height;
					other.args.mode = 0;
					other.args.facing = Math.sign(gSpeed) < 0 ? 'right' : 'left';
				}
			}
			else
			{
				const speed = xMoved;
				other.args.gSpeed = mode ? -speed : speed;
				other.args.xSpeed = speed;
				other.args.float = -1;
				other.noClip = true;
				other.args.antiSkid = 35;
				// other.xAxis = Math.sign(other.args.gSpeed);

				other.args.direction = -Math.sign(gSpeed);

				const shiftFactor = Math.min(Math.max(xDist * 1.333, 0), 1);

				if(!rolling)
				{
					other.args.corkscrew = Math.min(shiftFactor * 0.5, 0.375);
					other.args.animation = 'barrel-roll';
				}
				else
				{
					other.args.rolling = true;
				}

				if(mode === 0)
				{
					other.args.y = this.y + -this.args.height + this.args.height * shiftFactor * 2;
				}

				if(mode === 2)
				{
					other.args.y = this.y + -this.args.height * shiftFactor * 2;
				}
			}
		}
	}

	updateEnd()
	{
		super.updateEnd();

		if(!this.viewport || !this.viewport.collisions.has(this))
		{
			return;
		}

		const collidees = this.viewport.collisions.get(this);

		if(this.args.treadmill)
		{
			this.args.convey = 0;

			let speedCount = 0;
			let speedSum = 0;

			for(const [collidee, type] of collidees)
			{
				if(collidee.args.standingOn !== this)
				{
					continue;
				}

				if(collidee.args.gSpeed)
				{
					speedCount++;
					speedSum += collidee.args.gSpeed;
				}
			}

			if(speedCount)
			{
				this.args.convey = -speedSum / speedCount;
			}
		}

		if(this.args.convey)
		{
			for(const [collidee, type] of collidees)
			{
				if(!collidee.controllable || collidee.args.falling)
				{
					continue;
				}

				const conveyTo = collidee.bMap('findNextStep', this.args.convey).get(Platformer);

				if(conveyTo[3])
				{
					continue;
				}

				if(conveyTo[2])
				{
					collidee.args.xSpeed  = this.args.convey;
					collidee.args.ySpeed  = 0;
					collidee.args.falling = true;

					collidee.args.y = -1 + this.y - this.args.height;
				}

				collidee.args.x += conveyTo[0];
				collidee.args.y += conveyTo[1];
			}
		}

		if(!this.args.platform)
		{
			return;
		}

		const moveUp = Math.min(this.args.ySpeed, (this.args.y - this.yLast), 0);

		if(moveUp < 0)
		{
			for(let x = -this.args.width * 0.5 + 4; x < this.args.width * 0.5; x += 4)
			{
				const xx = this.args.x + x;
				const actors = this.viewport.actorsAtLine(xx, this.args.y + -this.args.height, xx, this.args.y + -moveUp + -this.args.height);

				for(const [actor, point] of actors)
				{
					if(!actor.controllable || !actor.args.falling || actor.args.y < this.args.y)
					{
						continue
					}

					actor.args.y = this.args.y + moveUp + -this.args.height;
					actor.args.ySpeed = this.args.ySpeed;
					actor.args.falling = false;
				}
			}
		}
	}

	sleep()
	{
		this.sleeping = true;

		// if(this.others.childOf)
		// {
		// 	this.others.childOf.sleep();
		// }

		if(this.args.drop && this.args.once && !this.args.float)
		{
			this.viewport.actors.remove(this);
		}

		if(this.args.drop && this.args.float >= 0)
		{
			this.args.ySpeed  = 0;
			this.args.float   = -1;
			this.args.active  = false;
			this.args.falling = false;

			this.viewport.onFrameOut(120, () => {
				this.args.y       = this.originalY;
				this.activatedAt  = null;
				this.args.goBack  = false;
				this.noClip       = false;

				this.args.ySpeed  = 0;
				this.args.float   = -1;
				this.args.active  = false;
				this.args.falling = false;

				this.viewport.setColCell(this);
			});
		}
	}

	get rotateLock() { return true; }
	get canStick() { return !this.args.platform; }
	get solid() { return this.args.solid && (!this.args.collapse || (this.args.float !== 0 || !this.args.goBack)); }
}

