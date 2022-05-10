import { Tag  } from 'curvature/base/Tag';
import { Bindable } from 'curvature/base/Bindable';

import { PointActor } from '../actor/PointActor';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class Platformer
{

	updateStart(host)
	{
		host.lastLayer = null;

		host.args.localCameraMode = null;

		if(host.args.dead)
		{
			return;
		}

		if(host.args.standingLayer && !host.args.static)
		{
			const layer = host.args.standingLayer.layer;

			let grindRegion = false;

			for(const region of host.regions)
			{
				if(region.grind)
				{
					grindRegion = true;
				}
			}

			if(!host.controllable)
			{
				host.args.grinding = false;
			}
			else if(layer && layer.meta.grinding)
			{
				host.args.grinding = true;
				host.args.direction = Math.sign(host.args.xSpeed || host.args.gSpeed);
			}
			else if(!grindRegion)
			{
				host.args.grinding = false;
			}

			if(host.args.grinding && host.args.falling)
			{
				host.args.grinding = false;
			}

		}

		if(!host.args.falling)
		{
			host.fallTime = 0;
		}
	}

	updateEnd(host)
	{
		if(!host.args.static && host.args.falling)
		{
			if(host.args.standingLayer && host.fallTime === 0)
			{
				host.args.xSpeed += host.args.standingLayer.offsetXChanged || 0;
				host.args.ySpeed += host.args.standingLayer.offsetYChanged || 0;
			}

			host.args.standingLayer = null;
		}

		const lastFocus = host.focused;

		if(!host.args.falling)
		{
			host.focused = false;
		}

		for(const region of host.regions)
		{
			if(region.focus)
			{
				host.viewport.auras.add(region.focus);

				host.focused = region.focus;
			}
		}

		if(lastFocus !== host && lastFocus !== host.focused)
		{
			host.viewport && host.viewport.auras.delete(lastFocus);
		}

		for(const [tag, cssArgs] of host.autoStyle)
		{
			const styles = {};

			for(const [prop, arg] of Object.entries(cssArgs))
			{
				if(arg in host.args)
				{
					styles[ prop ] = host.args[ arg ];
				}
			}

			tag.style(styles);
		}

		for(const [tag, attrsArgs] of host.autoAttr)
		{
			const attrs = {};

			for(const [attr, arg] of Object.entries(attrsArgs))
			{
				if(arg in host.args)
				{
					attrs[ attr ] = host.args[ arg ];
				}

			}

			tag.attr(attrs);
		}

		if(host.follower)
		{
			const frame = host.viewport.serializePlayer();
			const follower = host.follower;

			host.viewport.onFrameOut(5, () => {

				if(frame.input)
				{
					follower.controller && follower.controller.replay(frame.input);
					follower.readInput();
				}

				if(frame.args)
				{
					Object.assign(follower.args, frame.args);

					follower.viewport && follower.viewport.setColCell(host);
				}
			});

			if(host.follower.args.dead)
			{
				host.follower.args.dead = false;

				host.follower.args.x = host.x;
				host.follower.args.y = host.y;
			}
		}
	}

	update(host)
	{
		if(host.args.mercy)
		{
			host.args.spindashCharge = 0;
			host.args.dropDashCharge = 0;
		}

		if(typeof host.args.standingOn === 'number')
		{
			const standId = host.args.standingOn;
			const standOn = host.viewport.actorsById[standId];

			if(standOn)
			{
				host.args.standingOn = standOn;

				host.args.x = standOn.x;
				host.args.y = standOn.y - standOn.args.height;
			}
		}

		host.args.jumpBlocked = false;

		if(host.viewport)
		{
			host.age = host.viewport.args.frameId - host.startFrame
		}

		if(!host.xAxis
			|| Math.sign(host.args.gSpeed) !== host.args.pushing
			|| Math.sign(host.xAxis) !== host.args.pushing
		){
			host.args.pushing = false;
		}

		const startX = host.x;
		const startY = host.y;

		if(host.noClip && !host.controllable)
		{
			if(host.args.xSpeed)
			{
				host.args.x += host.args.xSpeed;
			}

			if(host.args.ySpeed)
			{
				host.args.y += host.args.ySpeed;
			}

			if(!host.args.float && host.args.falling)
			{
				host.args.ySpeed += host.args.gravity;
			}

			if(host.args.float > 0)
			{
				host.args.float--;
			}

			let collisions;

			switch(host.args.mode)
			{
				case MODE_CEILING:
					collisions = viewport.actorsAtPoint(
						host.args.x
						, host.args.y + host.args.height
						, host.args.width
						, host.args.height
					);
					break;

				case MODE_LEFT:
					collisions = viewport.actorsAtPoint(
						host.args.x - (host.args.height/2)
						, host.args.y + (host.args.width/2)
						, host.args.height
						, host.args.width
					);
					break;

				case MODE_RIGHT:
					collisions = viewport.actorsAtPoint(
						host.args.x + (host.args.height/2)
						, host.args.y + (host.args.width/2)
						, host.args.height
						, host.args.width
					);
					break;

				default:
				case MODE_FLOOR:
					collisions = viewport.actorsAtPoint(
						host.args.x
						, host.args.y
						, host.args.width
						, host.args.height
					);
					break;
			}

			if(collisions)
			{
				for(const actor of collisions)
				{
					if(actor.args === host.args)
					{
						continue;
					}

					actor.callCollideHandler(host);
				}
			}

			return;
		}

		if(!host.args.falling && !host.args.rolling && host.args.modeTime >= 1)
		{
			host.args.spinning = false;
		}

		if(host.args.rolling || host.args.jumping || host.spindashCharge)
		{
			host.args.spinning = true;
		}

		if(host.viewport
			&& host.args.respawning
			&& !host.viewport.args.isRecording
			&& !host.viewport.args.isReplaying
		){
			const stored = host.viewport.getCheckpoint(host.args.canonical);

			let toX, toY;

			if(stored && stored.checkpointId)
			{
				const checkpoint = host.viewport.actorsById[ stored.checkpointId ];

				toX = checkpoint.x;
				toY = checkpoint.y;
			}
			else if(host.def)
			{
				toX = host.def.get('x');
				toY = host.def.get('y');
			}
			else if(!host.canRoll && host.viewport.defsByName.get('wide-player-start'))
			{
				const startDef = host.viewport.defsByName.get('wide-player-start');

				toX = startDef.x;
				toY = startDef.y;
			}
			else if(host.viewport.defsByName.has('player-start'))
			{
				const startDef = host.viewport.defsByName.get('player-start');

				toX = startDef.x;
				toY = startDef.y;
			}

			host.args.animation = 'dropping';

			host.args.standingLayer = null;
			host.args.standingOn    = null;
			host.lastLayer = null;

			const xDiff = host.args.x - toX;
			const yDiff = host.args.y - toY;

			const xPanSpeed = Math.max(Math.abs((xDiff / 8)), 16);
			const yPanSpeed = Math.max(Math.abs((yDiff / 8)), 16);

			host.args.x -= Math.sign(xDiff) * xPanSpeed;
			host.args.y -= Math.sign(yDiff) * yPanSpeed;

			const viewport = host.viewport;

			if(Math.abs(xDiff) <= xPanSpeed)
			{
				host.args.x = toX;
			}

			if(Math.abs(yDiff) <= yPanSpeed)
			{
				host.args.y = toY;
			}

			if(Math.abs(xDiff) <= xPanSpeed && Math.abs(yDiff) <= yPanSpeed)
			{
				host.viewport.onFrameOut(60, () => {

					if(host.viewport.args.networked)
					{
						host.args.dead       = false;
						host.noClip          = false;
						host.args.respawning = false;
						host.args.display    = 'initial';
						host.args.ignore     = 4;

						host.args.xSpeed = 0;
						host.args.ySpeed = -3;
					}
					else
					{
						viewport.reset();
						viewport.startLevel(false);

					}

					viewport.args.paused = false;
				});
			}

			host.viewport && host.viewport.setColCell(host);

			return;
		}

		if(host.viewport
			&& host.viewport.meta.deathLine
			&& !host.args.dead
			&& host.controllable
			&& host.y > host.viewport.meta.deathLine
		){
			host.die();
			return;
		}

		if(host.controllable && !host.args.dead)
		{
			const radius = 0.5 * host.args.width;
			const direction = Math.sign(host.args.xSpeed);
			const height = Math.max(host.args.height, 0);

			const headPoint = host.rotatePoint(0, height * 0.75);
			// const headPoint = host.rotatePoint(radius * -direction, host.args.height * 0.75);

			let jumpBlock = host.getMapSolidAt(host.x + headPoint[0], host.y + headPoint[1]);

			if(Array.isArray(jumpBlock))
			{
				jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
			}

			if(host.args.rolling)
			{
				const rollTopPoint = host.rotatePoint(0, height);
				// const headPoint = host.rotatePoint(radius * -direction, host.args.height * 0.75);

				let rollJumpBlock = host.getMapSolidAt(
					host.x + rollTopPoint[0]
					, host.y + rollTopPoint[1]
				);

				if(Array.isArray(rollJumpBlock))
				{
					rollJumpBlock = !!rollJumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;

					host.args.jumpBlocked = !!rollJumpBlock;
				}

				host.args.jumpBlocked = !!rollJumpBlock;
			}

			if(!host.args.hangingFrom
				&& !host.args.falling
				&& this.checkBelow(host, host.x, host.y) && jumpBlock
			){
				host.die();
				return;
			}

			if(!host.args.falling && host.args.mode === 0)
			{
				const upFirstSpace = host.castRay(
					host.maxStep
					, host.upAngle
					, this.findUpSpace
				);

				if(upFirstSpace)
				{
					host.args.y -= upFirstSpace;
				}
			}
		}

		for(const [object, timeout] of host.ignores)
		{
			if(timeout <= 0)
			{
				host.ignores.delete(object);
			}
			else
			{
				host.ignores.set(object, -1 + timeout);
			}
		}

		host.args.skimming = false;

		if(host.args.falling)
		{
			host.args.airAngle = host.airAngle;

			if(host.args.displayAngle !== host.args.groundAngle)
			{
				const angleDiff = host.args.groundAngle + -host.args.displayAngle;

				host.args.displayAngle +=
					Math.sign(angleDiff)
					* (Math.abs(angleDiff) > 1 ? 1 : Math.abs(angleDiff))
					* 0.5;
			}
		}
		else
		{
			host.args.airAngle = 0;

			host.args.displayAngle = host.args.groundAngle;
		}

		if(host.args.halted < 1 && host.args.halted > 0)
		{
			host.args.halted = 0;
		}

		if(host.args.halted > 0)
		{
			host.args.halted--;

			return;
		}

		if(host.args.currentSheild && 'update' in host.args.currentSheild)
		{
			host.args.currentSheild.update(host);
		}

		if(host.args.rolling)
		{
			host.args.height = host.args.rollingHeight || host.args.height;
		}
		else if(host.args.jumping)
		{
			host.args.height = host.args.rollingHeight || host.args.height;
		}
		else if(host.canRoll)
		{
			host.args.height = host.args.normalHeight || host.args.height;
		}

		if(host.args.dontJump > 0)
		{
			host.args.dontJump--;
		}

		if(host.args.dontJump < 0)
		{
			host.args.dontJump = 0;
		}

		if(!host.viewport || host.removed)
		{
			return;
		}

		host.args.modeTime++;

		if(!host.args.falling)
		{
			if(Math.abs(host.args.gSpeed) < 1 && !host.impulseMag && host.args.modeTime > 3)
			{
				host.args.rolling = false
			}

			if(Math.abs(host.args.gSpeed) < 0.01)
			{
				host.args.gSpeed = 0;
			}
			else if(host.canRoll && host.yAxis > 0.55 && !host.args.ignore)
			{
				host.args.rolling = true;
			}
		}

		host.args.driving = false;

		if(host.args.standingOn && host.args.standingOn.isVehicle && !host.isVehicle)
		{
			const vehicle = host.args.standingOn;

			host.args.groundTimeTotal++;

			host.args.falling = true;
			host.args.flying  = false;
			host.args.jumping = false;
			host.args.driving = true;

			host.processInput();

			host.args.cameraMode = vehicle.args.cameraMode;

			if(host.willJump && host.yAxis < 0)
			{
				const leaving = host.args.standingOn;

				host.args.standingLayer = false;
				host.args.standingOn = false;
				host.willJump   = false;

				leaving.occupant = null;

				host.args.falling = true;
				host.args.jumping = true;

				// host.args.y -= vehicle.args.seatHeight || vehicle.args.height;
				host.args.y -= 16;

				host.args.xSpeed = vehicle.args.direction * 2 * -Math.sign(vehicle.args.seatAngle || -1);
				host.args.ySpeed = -host.args.jumpForce;
				vehicle.args.ySpeed = 0;
			}

			host.args.groundAngle = (vehicle.args.groundAngle || 0) + (vehicle.args.seatAngle || 0);

			if(host.willJump && host.yAxis >= 0)
			{
				host.args.standingOn.falling = false;
				host.willJump = false;

				host.args.standingOn.command_0();
			}

			return;
		}

		if(host.impulseMag !== null)
		{
			host.args.xSpeed += Number(Number(Math.cos(host.impulseDir) * host.impulseMag).toFixed(3));
			host.args.ySpeed += Number(Number(Math.sin(host.impulseDir) * host.impulseMag).toFixed(3));

			if(!host.impulseFal)
			{
				switch(host.args.mode)
				{
					case MODE_FLOOR:
						host.args.gSpeed = Math.cos(host.impulseDir) * host.impulseMag;
						break;

					case MODE_CEILING:
						host.args.gSpeed = -Math.cos(host.impulseDir) * host.impulseMag;
						break;

					case MODE_LEFT:
						host.args.gSpeed = -Math.sin(host.impulseDir) * host.impulseMag;
						break;

					case MODE_RIGHT:
						host.args.gSpeed = Math.sin(host.impulseDir) * host.impulseMag;
						break;
				}
			}
			else
			{
				host.args.falling = host.impulseFal || host.args.falling;
			}

			host.impulseMag   = null;
			host.impulseDir   = null;
			host.impulseFal   = null;
		}

		if(host.args.ignore === -2 && (host.args.falling === false || host.args.ySpeed > 64))
		{
			host.args.ignore = 0;
		}

		if(host.args.ignore === -3 && (!host.args.falling || host.args.ySpeed >= -10))
		{
			host.onNextFrame(() => host.args.ignore = 0);
		}

		if(host.args.ignore < 1 && host.args.ignore > 0)
		{
			host.args.ignore = 0;
		}

		if(host.args.ignore > 0)
		{
			host.args.ignore--;
		}

		if(host.args.mercy > 0)
		{
			host.args.mercy--;
		}

		if(host.args.startled > 0)
		{
			host.args.startled--;
		}

		if(host.args.float > 0)
		{
			host.args.float--;
		}

		if(host.args.standingOn instanceof PointActor)
		{
			host.args.standingOn.callCollideHandler(host);
		}

		if(!host.args.float && host.args.falling)
		{
			if(!host.args.standingOn || !host.args.standingOn.isVehicle)
			{
				host.args.standingOn = null;
				host.args.landed = false;
				host.lastAngles.splice(0);

				if(host.args.jumping && host.args.jumpedAt < host.y)
				{
					host.args.deepJump = true;
				}
				else if(host.args.jumping && host.args.jumpedAt > host.y + 160)
				{
					host.args.highJump = true;
				}
				else if(host.args.jumping)
				{
					host.args.deepJump = false;
					host.args.highJump = false;
				}
			}
		}
		else if(host.args.jumping && !host.args.falling)
		{
			host.args.jumping  = false;
			host.args.deepJump = false;
			host.args.highJump = false;
			host.args.jumpedAt = null;
		}

		if(!host.args.falling
			&& host.args.standingOn
			&& host.args.rolling
			&& host.args.modeTime < 3
			&& !host.args.dropDashCharge
			&& host.args.standingOn.args.convey
		){
			host.args.gSpeed = -host.args.standingOn.args.convey * 0.8;
		}

		const drag = host.getLocalDrag();

		let regions = new Set;

		if(!host.noClip)
		{
			regions = host.viewport.regionsAtPoint(host.x, host.y);

			for(const region of host.regions)
			{
				region.updateActor(host);
			}
		}

		let gSpeedMax = host.args.gSpeedMax;

		if(!host.isRegion)
		{
			for(const region of host.regions)
			{
				if(!regions.has(region))
				{
					host.regions.delete(region);

					host.crossRegionBoundary(region, false);
				}
			}

			for(const region of regions)
			{
				if(host.args.density)
				{
					if(region.args.density && host.args.density < region.args.density)
					{
						const densityRatio = region.args.density / host.args.density;

						let blocked = false;

						let blockers = host.getMapSolidAt(host.x, host.y - host.args.height);

						if(Array.isArray(blockers))
						{
							blockers.filter(x => ![...regions].includes(x));

							if(blockers.length)
							{
								blocked = true;
							}
						}

						if(!blocked)
						{
							const myTop     = host.y - host.args.height;
							const regionTop = region.y - region.args.height;

							const depth = Math.min(
								(myTop + -regionTop + 4) / host.args.height
								, 1
							);

							host.args.float = 1;

							const force = depth * drag;

							host.args.falling = true;

							if(depth > -1)
							{
								host.args.ySpeed -= force;

								host.args.ySpeed *= drag;
							}
							else if(depth < -1 && host.args.ySpeed < 0)
							{
								if(Math.abs(depth) < 0.25 && Math.abs(host.args.ySpeed) < 1)
								{
									host.args.ySpeed = 0;
									host.args.y = -1 + regionTop + host.args.height;
								}
							}
						}
					}
				}

				if(!host.regions.has(region))
				{
					host.regions.add(region);

					host.crossRegionBoundary(region, true);
				}
			}

			// if(!regions.size && host.def)
			// {
			// 	host.args.float = host.def.get('float') ?? host.args.float ?? 0;
			// }
		}

		if(host.willJump && !host.args.dontJump && (!host.args.falling || host.falltime < 2))
		{
			host.willJump = false;

			const tileMap = host.viewport.tileMap;

			const height = Math.max(host.args.height, 32);

			const headPoint = host.rotatePoint(0, height + 1);

			let jumpBlock = host.getMapSolidAt(host.x + headPoint[0], host.y + headPoint[1]);

			if(Array.isArray(jumpBlock))
			{
				jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
			}

			if(!jumpBlock)
			{
				let force = host.args.jumpForce * drag;

				if(host.running)
				{
					force = force * 1.5;
				}
				else if(host.crawling)
				{
					force = force * 0.5;
				}

				this.doJump(host, force);
			}

			return;
		}

		host.willJump = false;

		if(!host.viewport)
		{
			return;
		}

		if(host.noClip)
		{
			host.args.falling = true;
		}

		if(!host.args.static)
		{
			const groundPoint  = host.groundPoint;
			const regionsBelow = host.viewport.regionsAtPoint(groundPoint[0], groundPoint[1]+1);
			const standingOn   = host.getMapSolidAt(...groundPoint);

			if(!host.isRegion && host.args.mode === MODE_FLOOR && regionsBelow.size)
			{
				let falling = !standingOn;

				for(const region of regionsBelow)
				{
					if(host.broad || (
						!host.args.falling
						&& (host.y === region.y - region.args.height
							|| host.y + 1 === region.y - region.args.height
						)
					)){
						if(Math.max(Math.abs(host.args.gSpeed), Math.abs(host.args.xSpeed)) >= region.skimSpeed)
						{
							const speed = host.args.falling ? Math.abs(host.args.xSpeed) : Math.abs(host.args.gSpeed);

							host.args.gSpeed = speed * Math.sign(host.args.gSpeed || host.args.xSpeed);

							if(host.y - 16 < region.y - region.args.height)
							{
								host.args.skimming = true;
								host.args.y = region.y - region.args.height + -1;
								falling = false;
								region.skim(host);
							}
							else if(host.broad)
							{
								host.args.ySpeed--;
							}

							break;
						}
						else
						{
							host.args.xSpeed = host.args.gSpeed || host.args.xSpeed;
						}
					}
				}

				host.args.standingOn = null;
				// host.args.falling = falling || host.args.falling;

				host.args.falling = host.args.ySpeed >= 0 ? falling : host.args.falling;

				if(host.args.falling)
				{
					host.args.xSpeed = host.args.xSpeed || host.args.gSpeed;
					host.args.standingLayer = null;
				}
				else
				{
					host.args.gSpeed = host.args.gSpeed || host.args.xSpeed;
				}
			}
			else if(!host.noClip && !host.args.xSpeed && !host.args.ySpeed && !host.args.float)
			{
				host.args.falling = !this.checkBelow(host, ) || host.args.falling;
			}

			if(host.noClip || (!host.isRegion && !host.isEffect && host.args.falling && host.viewport))
			{
				if(host.args.grinding)
				{
					host.args.grinding = false;
				}

				host.args.mode    = MODE_FLOOR;
				host.args.gSpeed  = 0;
				host.args.pushing = false;

				if(host.args.xSpeed || host.args.ySpeed)
				{
					if(!host.args.hangingFrom)
					{
						this.updateAirPosition(host);

						host.swing = false;

						host.args.airTimeTotal++;
					}
					else
					{
						host.args.groundTimeTotal++;
					}
				}

				host.args.animationBias = Math.abs(host.args.airSpeed / host.args.flySpeedMax);

				if(host.args.animationBias > 1)
				{
					host.args.animationBias = 1;
				}
			}
			else if(!host.noClip || host.args.standingLayer || (!host.isRegion &&!host.isEffect && !host.args.falling))
			{
				host.args.xSpeed = 0;
				host.args.ySpeed = 0;
				host.xLast = host.args.x;
				host.yLast = host.args.y;

				if(host.args.grinding && !host.args.gSpeed)
				{
					host.args.gSpeed = Math.sign(host.args.direction || host.axis || host.xSpeedLast || host.gSpeedLast);
				}

				this.updateGroundPosition(host);

				host.args.groundTimeTotal++;

				host.args.animationBias = Math.abs((host.args.hSpeed * 0.75 || host.args.gSpeed) / host.args.gSpeedMax);

				if(host.args.animationBias > 1)
				{
					host.args.animationBias = 1;
				}
			}

			if(host.args.rolling && host.args.pushing)
			{
				host.args.gSpeed = 0;
			}

			if(!host.viewport)
			{
				return;
			}
		}

		const halfWidth  = Math.ceil(host.args.width/2);
		const halfHeight = Math.floor(host.args.height/2);

		// if(!host.isRegion && (host.args.pushed || ( !host.willStick && host.controllable )))
		if(!host.noClip && !host.isRegion && host.args.pushed)
		{
			let block;

			const testWallPoint = (direction) => {
				switch(host.args.mode)
				{
					case MODE_FLOOR:
						block = host.getMapSolidAt(
							host.x + halfWidth * direction + (direction === -1 ? 0 : -1)
							, host.y - halfHeight
						);
						break;

					case MODE_CEILING:
						block = host.getMapSolidAt(
							host.x + halfWidth * direction + (direction === -1 ? 0 : -1)
							, host.y + halfHeight
						);
						break;

					case MODE_LEFT:
						block = host.getMapSolidAt(
							host.x + halfHeight * (direction === -1 ? 0 : 2)
							, host.y
						)
						break;

					case MODE_RIGHT:
						block = host.getMapSolidAt(
							host.x - halfHeight * (direction === -1 ? 0 : 2)
							, host.y
						);
						break;
				}

				if(block && Array.isArray(block))
				{
					return block.filter(a => !a.isVehicle);
				}

				return block;
			};

			const leftWall  = testWallPoint(-1);
			const rightWall = testWallPoint(1);

			if(rightWall && !leftWall)
			{
				if(host.args.xSpeed > 0)
				{
					host.args.xSpeed = 0;
				}

				host.args.x--;
			}

			if(leftWall && !rightWall)
			{
				if(host.args.xSpeed > 0)
				{
					host.args.xSpeed = 0;
				}

				host.args.x++;
			}
		}

		if(!host.viewport || host.removed)
		{
			return;
		}

		const layerSwitch  = host.viewport.objectPalette['layer-switch'];
		const regionClass  = host.viewport.objectPalette['base-region'];
		const skipChecking = [regionClass];

		if(!host.isGhost && !(skipChecking.some(x => host instanceof x)))
		{
			let collisions;

			switch(host.args.mode)
			{
				case MODE_CEILING:
					collisions = viewport.actorsAtPoint(
						host.args.x
						, host.args.y + host.args.height
						, host.args.width
						, host.args.height
					);
					break;

				case MODE_LEFT:
					collisions = viewport.actorsAtPoint(
						host.args.x + (host.args.height/2)
						, host.args.y + (host.args.width/2)
						, host.args.height
						, host.args.width
					);
					break;

				case MODE_RIGHT:
					collisions = viewport.actorsAtPoint(
						host.args.x - (host.args.height/2)
						, host.args.y + (host.args.width/2)
						, host.args.height
						, host.args.width
					);
					break;

				default:
				case MODE_FLOOR:
					collisions = viewport.actorsAtPoint(
						host.args.x
						, host.args.y
						, host.args.width
						, host.args.height
					);
					break;
			}

			collisions.forEach(x => x.args !== host.args && !x.isPushable && x.callCollideHandler(host));
		}

		if(!host.viewport)
		{
			return;
		}

		const tileMap = host.viewport.tileMap;

		if(Math.abs(host.args.gSpeed) < 2 && !host.args.falling)
		{
			let stayStuck = host.stayStuck;

			host.regions.forEach(region => {
				stayStuck = stayStuck || region.args.sticky;
			});

			if(!stayStuck && !host.args.climbing)
			{
				const half = Math.floor(host.args.width / 2) || 0;

				// if(!tileMap.getSolid(host.x, host.y+1, host.args.layer))
				const mode = host.args.mode;

				if(host.args.mode === MODE_FLOOR && host.args.groundAngle <= -(Math.PI / 4))
				{
					host.args.gSpeed = 1;
				}
				else if(host.args.mode === MODE_FLOOR && host.args.groundAngle >= (Math.PI / 4) && host.args.groundAngle < Math.PI)
				{
					host.args.gSpeed = -1;
				}
				else if(mode === MODE_LEFT && (host.args.groundAngle < Math.PI * 0.15))
				{
					host.lastAngles.splice(0);

					// host.args.xSpeed = 2;

					host.args.mode = MODE_FLOOR
					host.args.falling = true;
					host.args.groundAngle = -Math.PI / 2;

					host.args.x += host.args.width/2;

					host.args.ignore = 30;

				}
				else if(mode === MODE_RIGHT && (host.args.groundAngle > -Math.PI * 0.15))
				{
					host.lastAngles.splice(0);

					// host.args.xSpeed = -2;

					host.args.mode = MODE_FLOOR
					host.args.falling = true;
					host.args.groundAngle = Math.PI / 2;
					host.args.x -= host.args.width/2;

					host.args.ignore = 30;
				}
				else if(mode === MODE_CEILING)
				{
					host.lastAngles.splice(0);

					host.args.xSpeed = 0;

					// host.args.y -= host.args.height;
					host.args.ignore = 8;
					host.args.falling = true;
					host.willJump = false;

					const gSpeed = host.args.gSpeed;

					host.args.groundAngle = Math.PI;
					host.args.mode = MODE_FLOOR;

					host.onNextFrame(() => {
						host.args.mode = MODE_FLOOR;

						host.willJump = false
						host.args.xSpeed = -gSpeed;
					});

					if(!host.args.rolling)
					{
						if(Math.sign(host.xSpeedLast) === -1)
						{
							host.args.direction = -1;
							host.args.facing = 'left'
							host.args.x++;
						}
						else if(Math.sign(host.xSpeedLast) === 1)
						{
							host.args.direction = 1;
							host.args.facing = 'right'
							host.args.x--;
						}
					}
				}
			}
		}

		host.args.landed = true;

		if(host.controllable)
		{
			host.args.x = (host.args.x);
			host.args.y = (host.args.y);
		}

		// if(!host.noClip && !host.args.falling && !host.isRegion)
		// {
		// 	if(host.args.mode === MODE_FLOOR && !host.args.gSpeed && !host.args.xSpeed)
		// 	{
		// 		let execs = 0;

		// 		const heading = Math.atan2(startY - host.y, startX - host.x);

		// 		host.args.xSpeed = 0;
		// 		host.args.ySpeed = 0;

		// 		while(host.getMapSolidAt(host.x, host.y - 1, false))
		// 		{
		// 			host.args.x += Math.cos(heading);
		// 			host.args.y += Math.sin(heading);

		// 			if(execs++ > 1000)
		// 			{
		// 				break;
		// 			}
		// 		}
		// 	}
		// }

		// if(host.args.falling)
		// {
		// 	host.args.gSpeed = 0;
		// }

		host.controllable && host.processInput();

		if(host.args.falling || host.args.gSpeed)
		{
			host.args.stopped = 0;
		}
		else
		{
			host.args.stopped++;
		}

		if(host.lastAngles.length > 0)
		{
			host.args.groundAngle = host.lastAngles.map(a=>Number(a)).reduce(((a,b)=>a+b)) / host.lastAngles.length;
		}

		if(isNaN(host.args.groundAngle))
		{
			console.log(host.lastAngles, host.lastAngles.length);
		}

		if(!host.args.float && !host.args.static)
		{
			const standingOn = host.getMapSolidAt(...host.groundPoint);

			if(Array.isArray(standingOn) && standingOn.length && !host.args.float)
			{
				host.args.standingLayer = false;

				const groundActors = standingOn.filter(
					a => a.args !== host.args && a.solid && a.callCollideHandler(host)
				);

				if(groundActors.length)
				{
					for(const groundActor of groundActors)
					{
						if(!groundActor.isVehicle && host.y > 1 + groundActor.y + -groundActor.args.height)
						{
							continue;
						}

						host.args.groundAngle = groundActor.groundAngle || 0;
						host.args.standingOn  = groundActor;

						// if(groundActor.args.standingLayer)
						// {
						// 	host.args.standingLayer = groundActor.args.standingLayer;
						// }
					}
				}
			}
			else if(standingOn)
			{
				host.args.standingOn = null;

				if(typeof standingOn === 'object')
				{
					host.args.standingLayer = standingOn;

					if(host.args.modeTime < 1 && standingOn.xLayerSpeed)
					{
						host.args.gSpeed = 0;
					}
				}
				else
				{
					host.args.standingLayer = null;
				}
			}
			else
			{
				host.args.standingOn = null;
			}
		}

		if(host.args.falling && host.args.ySpeed < host.args.ySpeedMax)
		{
			if(!host.args.float)
			{
				let gravity = 1;

				for(const region of host.regions)
				{
					if(!region.args.gravity && region.args.gravity !== 1)
					{
						continue;
					}

					gravity *= region.args.gravity;
				}

				host.args.ySpeed += host.args.gravity * gravity;
			}

			host.args.landed = false;
		}

		if(!host.args.falling)
		{
			this.checkDropDash(host);
			host.args.jumping = false;
		}

		// for(const behavior of host.behaviors)
		// {
		// 	behavior.update(host);
		// }

		if(host.twister)
		{
			host.twister.args.x = host.args.x;
			host.twister.args.y = host.args.y;

			if(host.args.mode)
			{
				host.twister.args.xOff = host.args.xOff
			}
			else
			{
				host.twister.args.xOff = host.args.xOff + -8 * host.args.direction;
			}

			host.twister.args.yOff = host.args.yOff + 16;

			host.twister.args.width  = host.args.width;
			host.twister.args.height = host.args.height;
		}

		if(host.pincherBg)
		{
			host.pincherBg.args.x = host.args.x;
			host.pincherBg.args.y = host.args.y;

			host.pincherBg.args.xOff = host.args.xOff;
			host.pincherBg.args.yOff = host.args.yOff;

			host.pincherBg.args.width  = host.args.width;
			host.pincherBg.args.height = host.args.height;
		}

		if(host.pincherFg)
		{
			host.pincherFg.args.x = host.args.x;
			host.pincherFg.args.y = host.args.y;

			host.pincherFg.args.xOff = host.args.xOff;
			host.pincherFg.args.yOff = host.args.yOff;

			host.pincherFg.args.width  = host.args.width;
			host.pincherFg.args.height = host.args.height;
		}

		if(host.args.falling)
		{
			host.args.rolling = false;
			host.fallTime++;
		}
		else
		{
			host.args.idleTime++;

			if(host.yAxis || host.xAxis)
			{
				host.args.idleTime = 0;
			}
		}

		host.args.carrying = !!host.carrying.size;

		if(host.args.carrying)
		{
			if(Math.abs(host.args.gSpeed) > 8)
			{
				host.args.gSpeed = 8 * Math.sign(host.args.gSpeed);
			}

			host.args.idleTime = 0;
			host.args.rolling = false;
		}
	}

	updateGroundPosition(host)
	{
		if(host.args.mercy)
		{
			if(Math.abs(host.args.gSpeed) > 10)
			{
				host.args.gSpeed = 10 * Math.sign(host.args.gSpeed);
			}
		}

		const drag = host.getLocalDrag();

		let gSpeedMax = host.args.gSpeedMax;

		if(host.running)
		{
			gSpeedMax = RUNNING_SPEED;
		}
		else if(host.crawling)
		{
			gSpeedMax = CRAWLING_SPEED;
		}

		let nextPosition = [0, 0];
		const radius = Math.ceil(host.args.width / 2);

		const wasPaused = host.paused;

		if(host.args.gSpeed || host.args.rolling || (host.canRoll && host.args.crouching))
		{
			const scanDist  = radius + Math.abs(host.args.gSpeed);
			const direction = Math.sign(host.args.gSpeed || host.args.direction);

			const max  = Math.abs(host.args.gSpeed);
			const step = 1;

			host.pause(true);

			let iter = 0

			const headBlock = host.args.modeTime > 10 && this.scanForward(host, host.args.gSpeed, 1);

			if(headBlock === false || headBlock > 0)
			{
				for(let s = 0; s < max; s += step)
				{
					if(host.args.height > 8 && host.args.modeTime > 1)
					{
						host.args.pushing = false;

						if(!host.args.rolling)
						{
							const headPoint = host.rotatePoint(
								radius * -direction
								, host.args.height
							);

							let headBlock = host.getMapSolidAt(host.x + headPoint[0], host.y + headPoint[1]);

							if(Array.isArray(headBlock))
							{
								headBlock = headBlock
								.filter(x =>
									x.args !== host.args
									&& x.callCollideHandler(host)
									&& x.solid
								)
								.length;
							}

							if(headBlock)
							{
								if(host.args.mode === MODE_CEILING)
								{
									host.args.x += radius * Math.sign(host.args.gSpeed);
									host.args.y += host.args.height;

									host.args.mode = MODE_FLOOR;
								}

								host.args.pushing = Math.sign(host.args.gSpeed);
								break;
							}
						}

						if(host.args.groundAngle === 0)
						{
							const waistPoint = host.rotatePoint(radius * -direction, host.args.height * 0.5);

							let waistBlock = host.getMapSolidAt(host.x + waistPoint[0], host.y + waistPoint[1])

							if(Array.isArray(waistBlock))
							{
								waistBlock = waistBlock.filter(x =>
									x.args !== host.args
									&& x.callCollideHandler(host)
									&& x.solid
								)
								.length;
							}

							if(waistBlock)
							{
								if(host.args.mode === MODE_CEILING)
								{
									host.args.x += radius * Math.sign(host.args.gSpeed);
									host.args.y += host.args.rollingeight || host.args.height;

									host.args.mode = MODE_FLOOR;
								}

								host.args.pushing = Math.sign(host.args.gSpeed);
								break;
							}
						}
					}

					for(const behavior of host.behaviors)
					{
						behavior.movedGround && behavior.movedGround(host);
					}

					nextPosition = this.findNextStep(host,step * direction);

					if(host.args.falling)
					{
						return;
					}

					if(!nextPosition)
					{
						break;
					}

					if(nextPosition[3])
					{
						host.args.moving = false;
						host.args.gSpeed = 0.15 * Math.sign(host.args.gSpeed);

						if(host.args.mode === MODE_LEFT || host.args.mode === MODE_RIGHT)
						{
							host.args.mode = MODE_FLOOR;
							host.lastAngles.splice(0);
						}

						break;
					}
					else if(nextPosition[2] === true)
					{
						const gSpeed = host.args.gSpeed;
						const gAngle = host.args.groundAngle;

						host.args.standingLayer = null;

						let radius;
						let hRadius;

						switch(host.args.mode)
						{
							case MODE_FLOOR:

								radius = host.args.width / 2;

								if(Math.abs(gSpeed) < radius)
								{
									host.args.x += radius * Math.sign(gSpeed);
								}
								else
								{
									host.args.x += Math.sign(gSpeed);
								}

								host.args.xSpeed =  gSpeed * Math.cos(gAngle);
								host.args.ySpeed = -gSpeed * Math.sin(gAngle);

								host.args.float = host.args.float < 0 ? host.args.float : 1;

								let falling = !!host.args.gSpeed;

								if(this.checkBelow(host, host.x, host.y))
								{
									host.args.gSpeed = gSpeed;
									host.args.xSpeed = 0;
									host.args.ySpeed = 0;
									falling = false;

									if(host.canRoll && host.yAxis > 0.55)
									{
										host.args.rolling = true;
									}
								}

								host.args.falling = falling;

								host.args.ignore = 2;

								break;

							case MODE_CEILING:

								host.args.y += host.args.height;
								// host.args.y++;

								host.args.float = host.args.float < 0 ? host.args.float : 1;

								host.args.falling = true;

								// host.args.groundAngle  = Math.PI;
								// host.args.displayAngle = Math.PI;

								host.args.mode   = MODE_FLOOR;
								host.args.xSpeed = -gSpeed * Math.cos(gAngle);
								host.args.ySpeed = gSpeed * Math.sin(gAngle);

								host.lastAngles.splice(0);
								host.args.direction *= -1;

								if(!host.args.rolling)
								{
									host.args.facing = host.args.facing === 'left' ? 'right' : 'left';
								}


								host.args.ignore = 3;

								break;

							case MODE_LEFT:

								radius =  host.args.width  / 2;
								hRadius = host.args.height / 2;

								if(!host.args.climbing)
								{
									if(Math.abs(host.args.gSpeed) < 2 && !host.args.rolling)
									{
										if(host.args.gSpeed < 0)
										{
											host.args.x -= host.args.direction;
											host.args.y -= host.args.gSpeed + -2;
											// host.args.groundAngle = 0;
										}
										else
										{
											host.args.x += radius;
											// host.args.y += hRadius;
										}
									}
									else
									{
										host.args.ignore = -3;
										host.args.x += radius;
										// host.args.y += hRadius;
									}

									host.args.xSpeed  =  gSpeed * Math.sin(gAngle);
									host.args.ySpeed  =  gSpeed * Math.cos(gAngle);

									// host.args.groundAngle = -Math.PI * 0.5;
									// host.args.mode = MODE_FLOOR;
									// host.onNextFrame(() => {
									// });
								}

								// host.args.mode = MODE_FLOOR;
								host.args.falling = true;

								break;

							case MODE_RIGHT:

								radius  = host.args.width  / 2;
								hRadius = host.args.height / 2;

								if(!host.args.climbing)
								{
									if(Math.abs(host.args.gSpeed) < 2 && !host.args.rolling)
									{
										if(host.args.gSpeed > 0)
										{
											host.args.x -= host.args.direction;
											host.args.y -= host.args.gSpeed + 2;
											// host.args.groundAngle = 0;
										}
										else
										{
											host.args.x -= radius;
											// host.args.y += hRadius;
										}
									}
									else
									{
										host.args.ignore = -3;
										host.args.x -= radius;
										// host.args.y += hRadius;
									}

									host.args.xSpeed  = -gSpeed * Math.sin(gAngle);
									host.args.ySpeed  = -gSpeed * Math.cos(gAngle);

									// host.args.groundAngle = Math.PI * 0.5;
									// host.args.mode = MODE_FLOOR;
									// host.onNextFrame(() => {
									// });

								}

								// host.args.mode = MODE_FLOOR;
								host.args.falling = true;

								break;
						}

						break;
					}
					else if(!nextPosition[0] && !nextPosition[1])
					{
						host.args.moving = false;

						switch(host.args.mode)
						{
							case MODE_FLOOR:
							case MODE_CEILING:
								host.args.gSpeed = 0;
								break;

							case MODE_LEFT:
							case MODE_RIGHT:

								break;
						}
					}
					else if((nextPosition[0] || nextPosition[1]) && !host.rotateLock)
					{
						host.args.moving = true;

						host.args.angle = nextPosition[0]
							? (Math.atan(nextPosition[1] / nextPosition[0]))
							: (Math.sign(nextPosition[1]) * Math.PI / 2);

						host.lastAngles.unshift(host.args.angle);

						host.lastAngles.splice(host.angleAvg);
					}

					if(!host.rotateLock)
					{
						switch(host.args.mode)
						{
							case MODE_FLOOR:
								host.args.x += nextPosition[0];
								host.args.y -= nextPosition[1];
								break;

							case MODE_CEILING:
								host.args.x -= nextPosition[0];
								host.args.y += nextPosition[1];
								break;

							case MODE_LEFT:
								host.args.x += nextPosition[1];
								host.args.y += nextPosition[0];
								break;

							case MODE_RIGHT:
								host.args.x -= nextPosition[1];
								host.args.y -= nextPosition[0];
								break;
						}

						if(host.args.angle > Math.PI / 4 && host.args.angle < Math.PI / 2)
						{
							const lastAngles = host.lastAngles.map(n => Number(n) - Math.PI / 2);
							Object.defineProperty(lastAngles, Bindable.NoGetters, {value: true});
							host.lastAngles = lastAngles;

							switch(host.args.mode)
							{
								case MODE_FLOOR:
									host.args.mode = MODE_RIGHT;
									break;

								case MODE_RIGHT:
									host.args.mode = MODE_CEILING;
									break;

								case MODE_CEILING:
									host.args.mode = MODE_LEFT;
									break;

								case MODE_LEFT:
									host.args.mode = MODE_FLOOR;
									break;
							}

							host.args.groundAngle -= Math.PI / 2;
						}
						else if(host.args.angle < -Math.PI / 4 && host.args.angle > -Math.PI / 2)
						{
							const orig = host.args.mode;

							const lastAngles = host.lastAngles.map(n => Number(n) + Math.PI / 2);
							Object.defineProperty(lastAngles, Bindable.NoGetters, {value: true});
							host.lastAngles = lastAngles;

							switch(host.args.mode)
							{
								case MODE_FLOOR:
									host.args.mode = MODE_LEFT;
									break;

								case MODE_RIGHT:
									host.args.mode = MODE_FLOOR;
									break;

								case MODE_CEILING:
									host.args.mode = MODE_RIGHT;
									break;

								case MODE_LEFT:
									host.args.mode = MODE_CEILING;
									break;
							}

							host.args.groundAngle = Number(host.args.groundAngle) + Math.PI / 2;
						}
					}
				}
			}
			else
			{
				host.args.pushing = Math.sign(host.args.gSpeed);
				// host.args.gSpeed  = 0;
			}

			const hRadius = Math.round(host.args.height / 2);

			if(!host.static && host.args.mode === MODE_FLOOR)
			{
				while((host.args.gSpeed <= 0 || host.args.modeTime < 3)
					 && host.getMapSolidAt(host.x - radius, host.y - hRadius, false)
				){
					host.args.x++;
				}

				while((host.args.gSpeed >= 0 || host.args.modeTime < 3)
					&& host.getMapSolidAt(host.x + radius, host.y - hRadius, false)
				){
					host.args.x--;
				}
			}

			wasPaused || host.pause(false);

			const pushFoward = host.xAxis && (Math.sign(host.xAxis) === Math.sign(host.args.gSpeed));

			if(
				host.args.mode === MODE_FLOOR
				|| host.args.mode === MODE_CEILING
				|| (host.args.gSpeed < 0 && host.args.mode === MODE_LEFT)
				|| (host.args.gSpeed > 0 && host.args.mode === MODE_RIGHT)
			){
				const pushBack = host.xAxis && (Math.sign(host.xAxis) !== Math.sign(host.args.gSpeed));
				const decel    = host.args.decel * ((host.args.rolling && pushBack) ? 3 : 0.75);

				if(!host.args.climbing && host.args.gSpeed && (!pushFoward || host.args.rolling))
				{
					if(host.args.grinding)
					{
						if(host.yAxis > 0.5)
						{
							// host.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(host.args.gSpeed);
						}
						else
						{
							host.args.gSpeed -= decel * 1/drag * 0.125 * Math.sign(host.args.gSpeed);
						}
					}
					else if(host.args.rolling)
					{
						host.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(host.args.gSpeed);
					}

					else if(!host.args.grinding && !host.args.rolling && (!host.xAxis || pushBack))
					{
						host.args.gSpeed -= decel * 1/drag * Math.sign(host.args.gSpeed);
					}

					if(Math.abs(host.args.gSpeed) < 0.1)
					{
						host.args.gSpeed = 0;
					}
				}
			}

			if(!pushFoward && Math.abs(host.args.gSpeed) < 1)
			{
				if(!host.args.wallSticking)
				{
					host.args.gSpeed = 0;
				}
			}

			let slopeFactor = 0;

			if(!host.args.climbing)
			{
				switch(host.args.mode)
				{
					case MODE_FLOOR:

						slopeFactor = host.args.groundAngle / (Math.PI/2);

						if(direction > 0)
						{
							slopeFactor *= -1;
						}

						break;

					case MODE_CEILING:

						slopeFactor = -host.args.groundAngle / (Math.PI/2);

						if(direction > 0)
						{
							slopeFactor *= -1;
						}

						break;

						break;

					case MODE_RIGHT:

						if(direction > 0)
						{
							slopeFactor = -1;

							slopeFactor -= host.args.groundAngle / (Math.PI/2);
						}
						else
						{
							slopeFactor = 1;

							slopeFactor += host.args.groundAngle / (Math.PI/2) ;
						}
						break;

					case MODE_LEFT:

						if(direction > 0)
						{
							slopeFactor = 1;

							slopeFactor -= host.args.groundAngle / (Math.PI/2);
						}
						else
						{
							slopeFactor = -1;

							slopeFactor += host.args.groundAngle / (Math.PI/2) ;
						}

						break;
				}

				if(host.args.grinding)
				{
					const speed = Math.abs(host.args.gSpeed);

					const direction = Math.sign(host.args.gSpeed || host.xSpeedLast || 1);

					host.args.direction = direction;

					// if(Math.sign(host.args.gSpeed) !== Math.sign(host.args.direction))
					// {
					// 	host.args.gSpeed = 0;
					// }

					if(speed < 6)
					{
						host.args.gSpeed = 6 * direction;
					}
					else if(speed > 40)
					{
						host.args.gSpeed = 40 * direction;
					}
					else if(slopeFactor < 0)
					{
						host.args.gSpeed *= 1.0000 - (0-(slopeFactor/2) * 0.015);
					}
					else if(slopeFactor > 0)
					{
						host.args.gSpeed *= 1.0015 * (1+(slopeFactor/2) * 0.045);
					}
					else
					{
						host.args.gSpeed += 0.1 * direction;
					}
				}
				else if(host.args.rolling || host.canRoll && host.args.crouching)
				{
					if(slopeFactor > 0 && host.args.modeTime > 3)
					{
						if(Math.abs(host.args.gSpeed) < host.args.gSpeedMax * 4)
						{
							host.args.gSpeed += 0.80 * slopeFactor * direction;
						}

						if(Math.abs(host.args.gSpeed) < 1)
						{
							host.args.gSpeed = (1 + slopeFactor**2) * Math.sign(host.args.gSpeed);
						}

						const regions = host.viewport.regionsAtPoint(host.x, host.y);

						for(const region of regions)
						{
							if(!region.args.maxSpeed || region.args.maxSpeed < 0)
							{
								continue;
							}

							if(region.args.maxSpeed < Math.abs(host.args.gSpeed))
							{
								host.args.gSpeed = region.args.maxSpeed * Math.sign(host.args.gSpeed);
							}
						}
					}
					else if(slopeFactor < 0)
					{
						if(Math.abs(host.args.gSpeed) < 10)
						{
							host.args.gSpeed += 0.65 * slopeFactor * direction;
						}
						else
						{
							host.args.gSpeed += 0.45 * slopeFactor * direction;
						}

					}

				}
				else if(!host.stayStuck)
				{
					if(slopeFactor > 0.25)
					{
						if(Math.abs(host.args.gSpeed) < host.args.gSpeedMax * 2)
						{
							host.args.gSpeed += 0.65 * slopeFactor * direction;
						}
					}
					else if(slopeFactor < 0)
					{
						if(Math.abs(host.args.gSpeed) < 10)
						{
							host.args.gSpeed += 0.30 * slopeFactor * direction;
						}
					}

					// let speedFactor = 1;

					// if(slopeFactor < 0 && Math.abs(host.args.gSpeed) < 2)
					// {
					// 	speedFactor = 0.99990 * (1 - (slopeFactor**2/4) / 2);
					// }
					// else if(slopeFactor > 1 && Math.abs(host.args.gSpeed) < host.args.gSpeedMax / 2)
					// {
					// 	speedFactor = 1.05000 * (1 + (slopeFactor**2/4) / 2);
					// }

					// if(host.args.mode === MODE_FLOOR && slopeFactor > 0.25)
					// {
					// 	if(Math.abs(host.args.gSpeed) < 1)
					// 	{
					// 		host.args.gSpeed = Math.sign(slopeFactor) * 4 * Math.sign(host.args.gSpeed);
					// 	}

					// 	host.args.gSpeed += slopeFactor * 1 * Math.sign(host.args.gSpeed);
					// }
					// else if(host.args.mode === MODE_FLOOR && slopeFactor < -0.25)
					// {
					// 	if(Math.abs(host.args.gSpeed) < 1)
					// 	{
					// 		host.args.gSpeed = Math.sign(-slopeFactor) * 4 * Math.sign(-host.args.gSpeed);
					// 	}

					// 	host.args.gSpeed += -slopeFactor * 1 * Math.sign(-host.args.gSpeed);
					// }

					// if(host.args.mode === MODE_LEFT && slopeFactor < 0.5)
					// {
					// 	if(Math.abs(host.args.gSpeed) < 1)
					// 	{
					// 		host.args.gSpeed = Math.sign(slopeFactor) * 4;
					// 	}

					// 	host.args.gSpeed += -slopeFactor * 1;
					// }

					// if(host.args.mode === MODE_RIGHT && slopeFactor < -0.5)
					// {
					// 	if(Math.abs(host.args.gSpeed) < 1)
					// 	{
					// 		host.args.gSpeed = Math.sign(slopeFactor) * 4;
					// 	}

					// 	host.args.gSpeed += slopeFactor * 1;
					// }


					if(Math.abs(host.args.gSpeed) < 1)
					{
						// if(slopeFactor <= -1)
						// {
						// 	host.args.gSpeed *= -0.5;
						// 	host.args.ignore = host.args.ignore || 8;
						// }
					}
				}
			}
		}

		if(nextPosition && (nextPosition[0] !== false || nextPosition[1] !== false))
		{
		}
		else
		{
			host.args.ignore = host.args.ignore || 1;

			if(host.args.falling)
			{
				host.args.gSpeed = 0;
			}
		}

		// if(host.controllable)
		// {
		// 	const radius = 0.5 * host.args.width;
		// 	const direction = Math.sign(host.args.xSpeed);
		// 	const height = Math.max(host.args.height, 0);

		// 	const headPoint = host.rotatePoint(0, height * 0.75);
		// 	// const headPoint = host.rotatePoint(radius * -direction, host.args.height * 0.75);

		// 	let jumpBlock = host.getMapSolidAt(host.x + headPoint[0], host.y + headPoint[1]);

		// 	if(Array.isArray(jumpBlock))
		// 	{
		// 		jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
		// 	}

		// 	if(!host.args.falling && this.checkBelow(host, host.x, host.y) && jumpBlock)
		// 	{
		// 		console.log(host.realAngle, host.args.groundAngle, host.args.mode);
		// 		console.log([host.x + headPoint[0], host.y + headPoint[1]]);
		// 		console.log(headPoint);

		// 		host.die();

		// 		return;
		// 	}
		// }
	}

	findAirPointA(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(x =>
				x.args !== actor.args
				&& x.callCollideHandler(actor)
				&& x.solid
			);

		if(actors.length > 0)
		{
			return actor.lastPointA;
		}

		const solid = tileMap.getSolid(point[0], point[1], actor.args.layer);

		if(solid)
		{
			return actor.lastPointA;
		}

		Object.assign(actor.lastPointA, point.map(Math.trunc));
	}

	findAirPointB(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		const actors = viewport.actorsAtPoint(point[0], point[1])
			.filter(x =>
				x.args !== actor.args
				&& x.callCollideHandler(actor)
				&& x.solid
			);

		if(actors.length > 0)
		{
			return actor.lastPointB;
		}

		if(tileMap.getSolid(point[0], point[1], actor.args.layer))
		{
			return actor.lastPointB;
		}

		Object.assign(actor.lastPointB, point.map(Math.trunc));
	}

	updateAirPosition(host)
	{
		const xSpeedOriginal = host.args.xSpeed;
		const ySpeedOriginal = host.args.ySpeed;

		host.args.standingLayer = null;

		const viewport  = host.viewport;
		const radius    = Math.ceil(host.args.width / 2);
		const direction = Math.sign(host.args.xSpeed);

		const tileMap = host.viewport.tileMap;

		const cSquared  = host.args.xSpeed**2 + host.args.ySpeed**2;
		const airSpeed  = cSquared ? Math.sqrt(cSquared) : 0;

		host.args.airSpeed = airSpeed;

		if(!airSpeed)
		{
			return;
		}

		if(host.controllable || host.isVehicle)
		{
			const quickSpin = host.springing;

			host.args.groundAngle += -Math.sign(host.args.groundAngle) * 0.001 * (quickSpin ? 125 : 50);
		}

		if(Math.abs(host.args.groundAngle) < 0.04)
		{
			host.args.groundAngle = 0;
		}

		if(host.noClip)
		{
			host.args.x += host.args.xSpeed;
			host.args.y += host.args.ySpeed;

			return;
		}

		if(host.args.jumping && host.args.ySpeed < 0 && host.args.ySpeed > -4)
		{
			host.args.xSpeed -= ((host.args.xSpeed / 0.125) / 256);
		}

		const upMargin = (host.args.flying
			? (host.args.height + host.args.yMargin)
			: host.args.height) || 1;

		host.upScan = true;

		// const upDistance = host.castRay(
		// 	Math.abs(host.args.ySpeed) + upMargin
		// 	, -Math.PI / 2
		// 	, host.findSolid
		// );

		const upScanDist = host.args.ySpeed < 0
			? (-host.args.ySpeed + upMargin)
			: 0;

		const upDistanceL = host.castRay(
			upScanDist
			, -Math.PI / 2
			, [-host.args.width/2 , 0]
			, host.findSolid
		);

		const upDistanceR = host.castRay(
			upScanDist
			, -Math.PI / 2
			, [host.args.width/2, 0]
			, host.findSolid
		);

		const upDistanceM = host.castRay(
			upScanDist
			, -Math.PI / 2
			, [0, 0]
			, host.findSolid
		);

		const upDistance = (upDistanceL || upDistanceR)
			? Math.min(...[upDistanceL, upDistanceR].filter(x => x !== false))
			: false;

		host.upScan = false;

		let hits = [];

		if(!host.args.hLock)
		{
			const hScanDist = host.args.xSpeed;

			const foreDistanceHead  = hScanDist ? this.scanForward(host, hScanDist, 0.9) : false;
			const foreDistanceWaist = hScanDist ? this.scanForward(host, hScanDist, 0.5) : false;
			const foreDistanceFoot  = hScanDist ? this.scanForward(host, hScanDist, 0.1) : false;

			const distances = [foreDistanceHead, foreDistanceWaist, foreDistanceFoot];

			// if(host.controllable && !host.args.falling && !host.args.rolling)
			// {
			// 	distances.push(foreDistanceFoot);
			// }

			hits = distances.filter(x => x !== false);
		}

		if(host.args.ySpeed && upDistance && host.lastLayer && host.lastLayer.offsetYChanged)
		{
			host.args.y += host.lastLayer.offsetYChanged + 1;

			host.args.ySpeed = host.lastLayer.offsetYChanged + 1;

			host.lastLayer = null;

			return;
		}

		let upCollisionAngle = false;

		if(![upDistanceL, upDistanceR].some(x => x === false))
		{
			upCollisionAngle = Math.atan2(upDistanceL - upDistanceR, host.args.width);
		}

		const willStick = host.willStick || host.args.deepJump;
		const xMove = host.xLast - host.x;

		if(upDistanceL
			&& upDistanceR
			&& upDistance <= upScanDist
			&& (!host.args.flying || host.canStick)
			// && !host.args.flying
			&& Math.abs(upCollisionAngle) < Math.PI / 4
			&& host.args.ySpeed <= 0
		){
			host.args.y -= upDistance - host.args.height;

			if(host.args.ySpeed)
			{
				host.args.falling = true;
			}

			host.args.ySpeed = Math.max(0, host.args.ySpeed);

			return;
		}

		if(!host.willStick
			&& hits.length > 1
			&& (upDistance === false || upDistance < host.args.height)
		){
			const xDirection = Math.sign(host.args.xSpeed);

			const maxHit = -1 + Math.max(...hits);
			const minHit = -1 + Math.min(...hits);

			const width   = host.args.width;
			const shiftBy = width + -minHit;
			// const shiftBy = width + -maxHit;
			// const shiftBy = radius + -maxHit;
			const shift = shiftBy * -xDirection;

			if(!isNaN(shift) && (!shift || shiftBy < width || Math.sign(shift) === Math.sign(host.args.xSpeed)))
			{
				host.args.x += shift;

				host.args.flySpeed = 0;
				host.args.xSpeed   = 0;
				host.args.gSpeed   = 0;
				host.args.mode     = MODE_FLOOR;
			}

			host.viewport.actorsAtPoint(
				host.x + (0+radius) * xDirection
				, host.y
				, host.args.width
				, host.args.height
			).forEach(actor => {

				if(actor === host)
				{
					return;
				}

				actor.callCollideHandler(host, xDirection < 0 ? 1 : 3);
			});
		}

		Object.assign(host.lastPointA, [host.x, host.y].map(Math.trunc));
		Object.assign(host.lastPointB, [host.x, host.y].map(Math.trunc));

		const scanDist = 1 + Math.ceil(airSpeed);

		const airPoint = host.castRay(
			scanDist
			, host.airAngle
			, this.findAirPointA
		);

		const airPointB = host.rotateLock
			? airPoint
			: host.castRay(
				scanDist
				, host.airAngle
				, [0, -3 * Math.sign(host.args.ySpeed || 1)]
				, this.findAirPointB
			);

		host.willJump = false;

		let blockers = false;

		let collisionAngle = false;

		if(![airPoint, airPointB].some(x => x === false))
		{
			collisionAngle = Math.atan2(airPoint[1] - airPointB[1], airPoint[0] - airPointB[0]);
		}

		host.xLast = host.args.x;
		host.yLast = host.args.y;

		if(airPoint !== false)
		{
			let angleIsWall = false;

			if(xSpeedOriginal < 0)
			{
				angleIsWall = collisionAngle <= Math.PI / 2;
			}

			if(xSpeedOriginal > 0)
			{
				angleIsWall = collisionAngle >= Math.PI / 2;
			}

			const isLeft  = angleIsWall && xSpeedOriginal < 0;
			const isRight = angleIsWall && xSpeedOriginal > 0;

			const solid = this.checkBelow(host, ...airPoint);

			if(!host.willStick)
			{
				// host.args.gSpeed = xSpeedOriginal || host.args.gSpeed;
				host.args.gSpeed = xSpeedOriginal;

				if(solid && typeof solid === 'object' && solid.offsetXChanged)
				{
					host.args.gSpeed -= solid.offsetXChanged;
				}
			}

			const stickX = airPoint[0];
			const stickY = airPoint[1];

			let away = false;

			if(!host.args.ySpeed || Math.sign(stickY - host.y) === Math.sign(host.args.ySpeed))
			{
				// host.args.xSpeed = 0;
				// host.args.ySpeed = 0;

				// if(host.args.flying && !angleIsWall && collisionAngle)
				// {
				// 	host.args.mode = MODE_CEILING;
				// 	host.args.xSpeed *= -1;
				// }
			}
			else
			{
				// host.args.y++;
				away = true;
			}

			// if(!host.viewport.tileMap.getSolid(stickX, stickY))
			// {
			// }
			host.args.x = stickX;
			host.args.y = stickY;

			blockers = host.getMapSolidAt(host.x + direction, host.y);

			if(Array.isArray(blockers))
			{
				blockers = blockers.filter(a => a.callCollideHandler(host));

				if(!blockers.length)
				{
					blockers = false;
				}
			}

			if(!host.rotateLock)
			{
				if(upCollisionAngle !== false && upCollisionAngle < 0)
				{
					host.args.gSpeed = 0;
					host.args.mode = MODE_LEFT;

					host.args.direction = 1;
					host.args.facing = 'right';
				}
				else if(upCollisionAngle !== false && upCollisionAngle > 0)
				{
					host.args.gSpeed = 0;
					host.args.mode = MODE_RIGHT;

					host.args.direction = -1;
					host.args.facing = 'left';
				}
				else if((host.willStick || (!isLeft && !isRight))
					&& !host.getMapSolidAt(host.x - direction, host.y)
					&& !host.getMapSolidAt(host.x - direction, host.y + 1)
				){
					if(isLeft)
					{
						host.args.gSpeed = 0;
						host.args.mode = MODE_LEFT;

						host.args.direction = 1;
						host.args.facing = 'right';
					}
					else if(isRight)
					{
						host.args.gSpeed = 0;
						host.args.mode = MODE_RIGHT;

						host.args.direction = -1;
						host.args.facing = 'left';
					}
					else if(upCollisionAngle !== false)
					{
						host.args.mode = MODE_CEILING;
					}
				}
			}

			// if(host.args.ySpeed < 0 && Math.abs(upCollisionAngle - Math.PI/2) < Math.PI/8)
			// {
			// 	return;
			// }

			const halfWidth    = Math.floor(host.args.width / 2);

			const sensorSpread = 6;
			const backPosition = this.findNextStep(host, -sensorSpread * 0.5);
			const forePosition = this.findNextStep(host, sensorSpread * 0.5);

			if(host.xSpeedLast > 0 && forePosition && forePosition[3])
			{
				host.args.x -= host.args.width;
			}
			else if(host.xSpeedLast < 0 && backPosition && backPosition[3])
			{
				host.args.x += host.args.width;
			}
			else if((!forePosition || forePosition[0] !== false && forePosition[1] !== false)
				|| (!backPosition || backPosition[0] !== false && backPosition[1] !== false)
			){
				let newAngle = 0;

				if(forePosition && backPosition)
				{
					newAngle = (ySpeedOriginal < 0 ? -1 : 1) * Number(Math.atan2(
						(forePosition[1]??0) - (backPosition[1]??0)
						, (forePosition[0]??0) - (backPosition[0]??0)
					));
				}


				if(isNaN(newAngle))
				{
					console.log(newAngle);

					throw new Error('angle is NAN!');
				}

				// const shallowLedgePoint = host.findNextStep(backPosition[1] < forePosition[1] ? 3 : -3);

				// let shallowLedge = false;

				// if(shallowLedgePoint[1] === Math.max(backPosition[1], forePosition[1]))
				// {
				// 	shallowLedge = true;
				// }

				// if(shallowLedge && Math.abs(forePosition[1] - backPosition[1]) > 2 * host.maxStep)
				// {
				// 	host.args.x += backPosition[1] < forePosition[1] ? -1 : 1;

				// 	host.args.ySpeed = ySpeedOriginal;

				// 	host.args.groundAngle = 0;
				// }
				// else
				if(forePosition && backPosition && !forePosition[2] && !backPosition[2] && !(forePosition[3] && backPosition[3]))
				{
					// host.args.groundAngle = host.args.angle = newAngle;

					if(host.canRoll && (host.yAxis > 0.55 || host.args.dropDashCharge))
					{
						host.args.rolling = true;
					}

					if(host.args.startled < 175)
					{
						host.args.falling = false;

						if(host.viewport.settings.rumble)
						{
							host.controller.rumble && host.controller.rumble({
								duration: 80,
								strongMagnitude: 0,
								weakMagnitude: Math.min(40, Math.max(Math.abs(host.args.ySpeed * 10),10)) / 40
							});
						}
					}

					host.args.groundAngle = newAngle;
					host.lastAngles.splice(0);
					// host.args.ignore = host.args.ignore || 5;

					const slopeDir = -host.args.groundAngle / (Math.PI * 0.4);

					let gSpeed = 0;

					gSpeed += xSpeedOriginal || -xMove;
					gSpeed += ySpeedOriginal * slopeDir;

					if(blockers && blockers.length)
					{
						gSpeed = 0;
					}

					if(host.args.mode % 2 == 1)
					{
						gSpeed *=-1;
					}

					// if(ySpeedOriginal)
					// {
					// 	gSpeed *= 0.75;
					// }

					if(typeof solid === 'object')
					{
						host.args.standingLayer = solid;

						if(solid.offsetXChanged)
						{
							gSpeed -= solid.offsetXChanged;

							host.args.x += solid.offsetXChanged;
						}
					}

					if(gSpeed)
					{
						host.args.gSpeed = gSpeed;
					}

					// host.args.x += gSpeed < 0 ? backPosition[0] : forePosition[0];
					// host.args.y += gSpeed < 0 ? backPosition[1] : forePosition[1];

					// host.args.xSpeed = 0;
					// host.args.ySpeed = 0;
				}
				else if(!host.args.dead
					&& host.args.startled < 175
					&& ( (forePosition && forePosition[2] && (!backPosition || !backPosition[3]) )
						|| ( (!forePosition || !forePosition[3]) && backPosition && backPosition[2])
					)
				){
					const speed = xSpeedOriginal || host.xSpeedLast;

					host.args.falling = false;
					host.args.gSpeed  = speed;

					// host.args.xSpeed = 0;
					// host.args.ySpeed = 0;

					host.args.float  = host.args.float || 1;

					host.args.x += speed;
					host.args.y -= (forePosition[1] || backPosition[1]);

					if(host.viewport.settings.rumble)
					{
						host.controller.rumble && host.controller.rumble({
							duration: 80,
							strongMagnitude: 0,
							weakMagnitude: Math.min(40, Math.max(Math.abs(host.args.ySpeed * 10),10)) / 40
						});
					}

					return;
				}

				if(Math.abs(host.args.gSpeed) < 1)
				{
					// host.args.gSpeed = 0; //Math.sign(host.args.gSpeed);
				}
			}
		}
		else if(host.args.ySpeed > 0)
		{
			if(host.args.mode === MODE_LEFT || host.args.mode === MODE_RIGHT)
			{
				const direction = host.args.mode === MODE_LEFT ? -1 : 1;

				host.args.direction = direction;

				host.args.groundAngle = Math.PI / 2 * direction;
			}

			// host.args.mode = MODE_FLOOR;

			if(!host.args.falling && !host.args.gSpeed)
			{
				host.args.gSpeed = Math.floor(xSpeedOriginal || host.xSpeedLast);
			}

			if(airPoint && (yPointDir === ySpeedDir || (!yPointDir && ySpeedDir === 1)))
			{
				host.args.x = Number(airPoint[0]);
				host.args.y = Number(airPoint[1]);

				host.args.falling = false;

				if(host.viewport.settings.rumble)
				{
					host.controller.rumble && host.controller.rumble({
						duration: 80,
						strongMagnitude: 0,
						weakMagnitude: Math.min(40, Math.max(Math.abs(host.args.ySpeed * 10),10)) / 40
					});
				}
			}
		}

		if(!tileMap.getSolid(host.x + (host.args.width / 2) * Math.sign(host.args.xSpeed), host.y, host.args.layer))
		{
			if(Math.abs(host.args.xSpeed) > host.args.xSpeedMax)
			{
				host.args.xSpeed = host.args.xSpeedMax * Math.sign(host.args.xSpeed);
			}

			if(Math.abs(host.args.ySpeed) > host.args.ySpeedMax)
			{
				host.args.ySpeed = host.args.ySpeedMax * Math.sign(host.args.ySpeed);
			}
		}

		if(airPoint === false)
		{
			if(host.args.xSpeed)
			{
				const edgeTest = host.willStick ? false : host.getMapSolidAt(
					host.x + (1+radius) * Math.sign(host.args.xSpeed)
					, host.y - host.args.height / 2
				);

				const topTest = host.getMapSolidAt(
					host.x, host.y - 24
				);

				if(!edgeTest)
				{
					host.args.x = Number(host.args.x) + Number(host.args.xSpeed);
				}

				if(topTest)
				{
					// host.args.ySpeed += topTest.yOffsetChanged;
					host.args.y      += host.args.height;
				}
			}

			if(host.args.ySpeed)
			{
				host.args.y = Number(Number(host.args.y) + Number(host.args.ySpeed));

				if(host.args.flying && host.args.ySpeed < 0 && upDistance > 0)
				{
					host.args.y += (upMargin - upDistance) + 4;
					host.args.ySpeed = 0;
				}
			}
		}
		else if(host.viewport && host.ySpeedLast > 0)
		{
			if(host.viewport.tileMap.getSolid(host.args.x, host.args.y)
				&& !host.viewport.tileMap.getSolid(host.args.x, host.args.y - 1)
			){
				host.args.y--;
			}
		}

		if(host.args.standingOn instanceof PointActor)
		{
			const groundTop = host.args.standingOn.y + -host.args.standingOn.args.height + -1;

			if(host.y < groundTop || host.args.ySpeed < 0)
			{
				host.args.standingOn = null;
			}
		}
	}

	checkDropDash(host)
	{
		if(host.dropDashCharge && host.args.mode === MODE_FLOOR)
		{
			const dropBoost = host.dropDashCharge * Math.sign(host.args.direction);

			host.dropDashCharge = 0;

			host.onNextFrame(()=>{
				host.args.gSpeed += dropBoost
				host.args.rolling = true;
			});

			const viewport = host.viewport;

			const dustParticle = new Tag('<div class = "particle-dust">');

			const dustPoint = host.rotatePoint(host.args.gSpeed, 0);

			dustParticle.style({
				'--x': dustPoint[0] + host.x
				, '--y': dustPoint[1] + host.y
				, 'z-index': 0
				, opacity: Math.random() * 2
			});

			viewport.particles.add(dustParticle);

			setTimeout(() => {
				viewport.particles.remove(dustParticle);
			}, 350);
		}
	}

	findDownSolid(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		if(actor.args.groundAngle === 0)
		{
			const regions = actor.viewport.regionsAtPoint(point[0], point[1]);

			for(const region of regions)
			{
				if(actor.args.mode === MODE_FLOOR
					&& -1 + point[1] === region.y + -region.args.height
					&& Math.abs(actor.args.gSpeed) >= region.skimSpeed
				){
					return -1 + i;
				}
			}
		}

		if(tileMap.getSolid(point[0], point[1], actor.args.layer))
		{
			return i;
		}

		const actors = viewport.actorsAtPoint(point[0], point[1])
		.filter(a =>
			a.args !== actor.args
			&& a.callCollideHandler(actor)
			&& a.solid
		);

		if(actors.length > 0)
		{
			return i;
		}
	}

	findUpSpace(i, point, actor)
	{
		if(!actor.viewport)
		{
			return;
		}

		const viewport = actor.viewport;
		const tileMap  = viewport.tileMap;

		if(actor.args.groundAngle <= 0)
		{
			const regions = actor.viewport.regionsAtPoint(point[0], point[1]);

			for(const region of regions)
			{
				if(actor.args.mode !== MODE_FLOOR
					|| point[1] !== 1 + region.y + -region.args.height
					|| Math.abs(actor.args.gSpeed) <= region.skimSpeed
				){
					const actors = viewport.actorsAtPoint(point[0], point[1])
					.filter(x =>
						x.args !== actor.args
						&& x.callCollideHandler(actor)
						&& x.solid
					);

					if(actors.length === 0)
					{
						if(!tileMap.getSolid(point[0], point[1], actor.args.layer))
						{
							return i;
						}
					}
				}
			}
		}

		const actors = viewport.actorsAtPoint(point[0], point[1]);
		const solids = [];

		for(const x of actors)
		{
			if(x.args === actor.args)
			{
				continue;
			}

			if(!x.callCollideHandler(actor))
			{
				continue;
			}

			if(!x.solid)
			{
				continue;
			}

			solids.push(x);
		}

		if(solids.length === 0)
		{
			if(!tileMap.getSolid(point[0], point[1], actor.args.layer))
			{
				return i;
			}
		}
	}

	findNextStep(host, offset)
	{
		if(!host.viewport)
		{
			return;
		}

		if(host.stepCache[offset] !== undefined)
		{
			return host.stepCache[offset];
		}

		const viewport = host.viewport;
		const tileMap  = viewport.tileMap;
		const maxStep  = host.maxStep * ((host.args.falling&&!host.args.xSpeed) ? 3 : 1);
		const radius   = Math.max(host.args.width / 2, 1);

		const sign = Math.sign(offset);

		let downFirstSolid = false;
		let upFirstSpace   = false;

		let prevUp = 0, prevDown = 0, prev = 0;

		let col = 0;

		for(; col < Math.abs(offset); col += 1)
		{
			downFirstSolid = false;
			upFirstSpace   = false;

			let offsetPoint;

			const columnNumber = (1 + col) * sign;

			switch(host.args.mode)
			{
				case MODE_FLOOR:
					offsetPoint = [columnNumber, 1]
					break;

				case MODE_RIGHT:
					offsetPoint = [1, -columnNumber]
					break;

				case MODE_CEILING:
					offsetPoint = [-columnNumber, -1]
					break;

				case MODE_LEFT:
					offsetPoint = [-1, columnNumber]
					break;
			}

			downFirstSolid = host.castRay(
				maxStep// * (1+col)
				, host.downAngle
				, offsetPoint
				, this.findDownSolid
			);

			if(downFirstSolid === false)
			{
				return [false, false, true];
			}

			const downDiff = prevDown - downFirstSolid;

			if(Math.abs(downDiff) >= maxStep)
			{
				return [false, false, downDiff < 0 , downDiff > 0];
			}

			if(downFirstSolid === 0)
			{
				let offsetPoint;

				switch(host.args.mode)
				{
					case MODE_FLOOR:
						offsetPoint = [columnNumber, 0]
						break;

					case MODE_RIGHT:
						offsetPoint = [0, -columnNumber]
						break;

					case MODE_CEILING:
						offsetPoint = [-columnNumber, 0]
						break;

					case MODE_LEFT:
						offsetPoint = [0, columnNumber]
						break;
				}

				const upLength = +1 + maxStep;

				upFirstSpace = host.castRay(
					upLength
					, host.upAngle
					, offsetPoint
					, this.findUpSpace
				);

				const upDiff = Math.abs(prevUp - upFirstSpace);

				if(upFirstSpace === false)
				{
					return [false, false, false, true];
				}

				if(upDiff >= maxStep)
				{
					return [false, false, false, true];
				}

				prev = prevUp = upFirstSpace;
			}
			else
			{
				prev = prevDown = downFirstSolid;
			}

			if(upFirstSpace !== false)
			{
				host.stepCache[col * sign] = [col * sign, upFirstSpace, false];
			}
			else
			{
				host.stepCache[col * sign] = [col * sign, -downFirstSolid, false];
			}
		}

		if(upFirstSpace !== false)
		{
			return [col * sign, upFirstSpace, false];
		}

		return [col * sign, -downFirstSolid, false];
	}

	castRay(...args)
	{
		let length   = 1;
		let callback = () => {};
		let angle    = Math.PI / 2;
		let offset   = [0,0];

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

		for(let i = 0; i < Math.floor(length); i++)
		{
			const bottom  = [
				host.args.x + offset[0] + (i * Math.cos(angle))
				, host.args.y + offset[1] + (i * Math.sin(angle))
			];

			const retVal = callback(i, bottom, host);

			if(retVal !== undefined)
			{
				return retVal;
			}
		}

		return false;
	}

	doJump(host, force)
	{
		if(
			host.args.ignore
			|| host.args.falling
			|| !host.args.landed
			|| host.args.float
		){
			return;
		}

		const jumpEvent = new CustomEvent('jump', {cancelable:true, detail:{host, force}});

		if(!host.dispatchEvent(jumpEvent))
		{
			return;
		}

		if(host.args.standingOn && host.args.standingOn.args.yForce)
		{
			force += Math.max(0, host.args.standingOn.args.yForce * 0.25);
		}
		else if(host.args.standingOn && host.args.standingOn.yLast)
		{
			force += Math.max(0, host.args.standingOn.yLast - host.args.standingOn.args.y);
		}

		const radius     = host.args.width / 2;
		const scanRadius = Math.min(radius, 4);

		const backPosition = this.findNextStep(host, -scanRadius);
		const forePosition = this.findNextStep(host, +scanRadius);
		const sensorSpread = scanRadius * 2;

		let groundAngle = Math.atan2(backPosition[1] - forePosition[1], Math.ceil(sensorSpread));

		host.args.ignore  = 6;
		host.args.pushing = false;
		host.args.landed  = false;
		host.args.falling = true;

		const originalMode = host.args.mode;

		switch(host.args.mode)
		{
			case MODE_FLOOR:
				host.args.y -= 16;
				break;

			case MODE_RIGHT:
				groundAngle += -Math.PI / 2;
				host.args.x += -host.args.width / 2;
				break;

			case MODE_CEILING:
				groundAngle += Math.PI;
				host.args.y += host.args.normalHeight || host.args.height;
				break;

			case MODE_LEFT:
				groundAngle += Math.PI / 2;
				host.args.x += host.args.width / 2;
				break;
		}

		let gSpeedReal = host.args.gSpeed;

		if(host.args.standingOn && host.args.standingOn.args.convey)
		{
			gSpeedReal += host.args.standingOn.args.convey;
		}

		host.args.standingOn = null;

		host.args.xSpeed = gSpeedReal * Math.cos(groundAngle);
		host.args.ySpeed = gSpeedReal * Math.sin(groundAngle);

		const jumpAngle = groundAngle - Math.PI / 2;

		let xJump = force * Math.cos(jumpAngle);
		let yJump = force * Math.sin(jumpAngle);

		if(Math.abs(xJump) < 0.01)
		{
			xJump = 0;
		}

		if(Math.abs(yJump) < 0.01)
		{
			yJump = 0;
		}

		host.args.airAngle = jumpAngle;

		host.args.xSpeed += xJump;
		host.args.ySpeed += yJump;

		host.args.jumpedAt = host.y;
		host.args.jumping  = true;

		const tileMap = host.viewport.tileMap;

		if(tileMap.getSolid(host.x + (host.args.width / 2) * Math.sign(host.args.xSpeed), host.y, host.args.layer))
		{
			// if(tileMap.getSolid(host.x + (1 + host.args.width / 2) * Math.sign(host.args.xSpeed), host.y, host.args.layer))
			// {
			// 	host.args.x -= 2 * Math.sign(host.args.xSpeed);
			// }

			host.args.xSpeed = 0;
		}

		host.args.rolling = false;

		host.args.mode = MODE_FLOOR;

		host.args.groundAngle = 0;
		host.args.gSpeed = 0;
	}

	impulse(host, magnitude, direction, willFall = false)
	{
		host.impulseMag = magnitude;
		host.impulseDir = direction;
		host.impulseFal = willFall;
	}

	scanForward(host, speed, height = 0.5, scanActors = true)
	{
		const dir      = Math.sign(speed);
		const radius   = host.args.width / 2;
		const scanDist = Math.abs(speed);
		const viewport = host.viewport;

		if(!viewport)
		{
			return;
		}

		const tileMap  = viewport.tileMap;

		const startPoint = host.args.falling
			? [radius * -dir, -host.args.height * height]
			: host.rotatePoint(radius * -dir, host.args.height * height);

		return host.castRay(
			scanDist + host.args.width
			, host.args.falling
				? [Math.PI,0,0][dir+1]
				: host.realAngle + [0,0,Math.PI][dir+1]
			, startPoint
			, scanActors ? host.findSolid : host.findSolidTile
		);
	}

	scanBottomEdge(direction = 1)
	{
		const tileMap = host.viewport.tileMap;

		const radius = host.args.width / 2;

		const leftCorner = tileMap.getSolid(host.x - radius, host.y - 1, host.args.layer);
		const rightCorner = tileMap.getSolid(host.x + radius, host.y - 1, host.args.layer);

		if(leftCorner && rightCorner)
		{
			return;
		}

		return host.castRay(
			host.args.width
			, (direction < 0 ? Math.PI : 0)
			, [-direction * radius, 0]
			, (i,point) => {
				const actors = host.viewport
					.actorsAtPoint(point[0], point[1])
					.filter(a => a.args !== host.args);

				if(!actors.length && !tileMap.getSolid(point[0], point[1] + 1, host.args.layer))
				{
					return i;
				}
			}
		);
	}

	// scanVerticalEdge(direction = 1)
	// {
	// 	const tileMap = host.viewport.tileMap;

	// 	return host.castRay(
	// 		host.args.height + 1
	// 		, Math.PI / 2
	// 		, [direction * host.args.width / 2, -host.args.height]
	// 		, (i,point) => {

	// 			const actors = host.viewport
	// 				.actorsAtPoint(point[0], point[1])
	// 				.filter(a => a.args !== host.args);

	// 			if(actors.length || tileMap.getSolid(point[0], point[1], host.args.layer))
	// 			{
	// 				return i;
	// 			}
	// 		}
	// 	);
	// }

	checkBelow(host, testX = null, testY = null)
	{
		testX = testX ?? host.x;
		testY = testY ?? host.y;

		const lPoint = [];
		const rPoint = [];

		const spread = 0;

		switch(host.args.mode)
		{
			case MODE_FLOOR:
				lPoint[0] = testX + spread;
				lPoint[1] = testY + 1;
				rPoint[0] = testX - spread;
				rPoint[1] = testY + 1;
				break;
			case MODE_LEFT:
				lPoint[0] = testX - 1;
				lPoint[1] = testY + spread;
				rPoint[0] = testX - 1;
				rPoint[1] = testY - spread;
				break;
			case MODE_CEILING:
				lPoint[0] = testX - spread;
				lPoint[1] = testY - 1;
				rPoint[0] = testX + spread;
				rPoint[1] = testY - 1;
				break;
			case MODE_RIGHT:
				lPoint[0] = testX + 1;
				lPoint[1] = testY + spread;
				rPoint[0] = testX + 1;
				rPoint[1] = testY - spread;
				break;
		}

		let below = host.getMapSolidAt(...lPoint);

		// if(!below)
		// {
		// 	below = this.getMapSolidAt(...rPoint);
		// }

		if(Array.isArray(below))
		{
			below = below.filter(x => x.callCollideHandler(host)).length;
		}

		return below;
	}
}
