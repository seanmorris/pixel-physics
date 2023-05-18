import { Tag  } from 'curvature/base/Tag';
import { Bindable } from 'curvature/base/Bindable';

import { PointActor } from '../actor/PointActor';

import { Layer  } from '../viewport/Layer';
import { CharacterString } from '../ui/CharacterString';

const MODE_FLOOR   = 0;
const MODE_LEFT    = 1;
const MODE_CEILING = 2;
const MODE_RIGHT   = 3;

export class Platformer
{
	updateStart(host)
	{
		this.stepsTaken = 0;

		if(host.knocked)
		{
			host.args.knocked = Math.sign(host.args.xSpeed || host.args.gSpeed);
		}

		if(!host.args.falling && host.knocked)
		{
			if(host.args.ySpeedLast < 3 && host.pop)
			{
				host.pop(host.knocked);
			}

			host.args.ySpeed  = -host.ySpeedLast * 0.7;
			host.args.falling = true;
			host.args.y--;
		}

		if(!host.args.falling)
		{
			host.modeLast = host.args.mode;

			if(host.args.grinding)
			{
				host.args.wasGrinding = true;
			}
			else
			{
				host.args.wasGrinding = false;
			}
		}

		host.args.sliding = false;
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

			if(!host.controllable && !host.canGrind)
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
		if(!host.args.falling)
		{
			host.args.jumpArced = false;
		}
		else if(host.args.jumping && (host.args.ySpeed > -3 || (host.args.ySpeed >= 0 && host.ySpeedLast < 0)))
		{
			host.args.jumpArced = true;
		}

		if(!host.args.static && host.args.falling)
		{
			if(host.args.standingLayer && host.fallTime === 0)
			{
				host.args.xSpeed += host.args.standingLayer.offsetXChanged || 0;
				host.args.ySpeed += host.args.standingLayer.offsetYChanged || 0;
			}

			host.args.standingLayer = null;
		}

		if(!host.controllable)
		{
			return;
		}

		if(host.args.popChain.length && host.args.grinding)
		{
			if(!host.grindReward)
			{
				host.grindReward = {label: 'Rail Grind', points: 100, multiplier: 1, direction: Math.sign(host.args.gSpeed)};
				host.args.popChain.push(host.grindReward);
			}

			host.grindReward.points += (Math.round(host.args.gSpeed / 10) * host.grindReward.direction) || 1;
		}

		if(host.airReward && host.args.falling)
		{
			// host.grindReward.points += (Math.round(host.args.gSpeed / 10) * host.grindReward.direction) || 1;
			host.airReward.points += Math.ceil(Math.abs(host.args.ySpeed) + Math.abs(host.args.xSpeed));
		}

		if(!host.args.popChain)
		{
			host.grindReward = null;
			host.airReward = null;
		}

		if(!host.args.falling && (!host.args.grinding && host.groundTime > 1))
		{
			host.grindReward = null;
			host.airReward = null;
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

		if(!host.args.falling
			&& !host.args.rolling
			&& !host.args.hangingFrom
			&& (!host.args.grinding && host.groundTime > 1)
			&& !host.args.bouncing
			&& (!host.punched && !host.readyTime)
			&& host.args.popChain.length
		){
			host.totalCombo();
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

		if(!host.xAxis
			|| Math.sign(host.args.gSpeed) !== host.args.pushing
			|| Math.sign(host.xAxis) !== host.args.pushing
		){
			host.args.pushing = false;
		}

		const startX = host.args.x;
		const startY = host.args.y;

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

			if(host.impulseMag !== null)
			{
				this.applyImpulse(host);
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
			&& !host.args.npc
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

			let jumpBlock = host.getMapSolidAt(host.args.x + headPoint[0], host.args.y + headPoint[1]);

			if(Array.isArray(jumpBlock))
			{
				jumpBlock = !!jumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;
			}

			if(host.args.rolling)
			{
				const rollTopPoint = host.rotatePoint(0, height);
				// const headPoint = host.rotatePoint(radius * -direction, host.args.height * 0.75);

				let rollJumpBlock = host.getMapSolidAt(
					host.args.x + rollTopPoint[0]
					, host.args.y + rollTopPoint[1]
				);

				if(Array.isArray(rollJumpBlock))
				{
					rollJumpBlock = !!rollJumpBlock.filter(a => !a.args.platform && !a.isVehicle).length;

					host.args.jumpBlocked = !!rollJumpBlock;
				}

				host.args.jumpBlocked = !!rollJumpBlock;
			}

			if(!host.args.hangingFrom
				&& !host.noClip
				&& !host.args.falling
				&& this.checkBelow(host, host.args.x, host.args.y) && jumpBlock
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
			else if(host.canRoll && host.yAxis > 0.55 && !host.args.ignore && !host.carrying.size)
			{
				host.args.rolling = true;
			}

			if(host.args.mode === 0 && !host.args.groundAngle)
			{
				const dSolid     = host.getMapSolidAt(host.args.x + 0 * host.args.direction, host.args.y + 2);
				const dSolidF    = host.getMapSolidAt(host.args.x + 4 * host.args.direction, host.args.y + 2);
				const uSolidF    = host.getMapSolidAt(host.args.x + 4 * host.args.direction, host.args.y - 2);
				const dSolidF2   = host.getMapSolidAt(host.args.x + 2 * host.args.direction, host.args.y + 2);
				const dSolidB    = host.getMapSolidAt(host.args.x - 4 * host.args.direction, host.args.y + 2);
				const uSolidB    = host.getMapSolidAt(host.args.x - 4 * host.args.direction, host.args.y - 2);

				if(dSolid && !dSolidF && !uSolidF)
				{
					host.args.teeter = 1;

					if(!dSolidF2)
					{
						host.args.teeter = 2;
					}
				}
				else if(dSolid && !dSolidB && !uSolidB)
				{
					host.args.teeter = -1;
				}
				else
				{
					host.args.teeter = 0;
				}
			}
			else
			{
				host.args.teeter = 0;
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

			if(host.willJump && (host.yAxis < 0 || (host.args.standingOn && host.args.standingOn.quickDrop)))
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
				if(!(leaving && leaving.quickDrop))
				{
					host.args.xSpeed = vehicle.args.direction * 2 * -Math.sign(vehicle.args.seatAngle || -1);
					host.args.ySpeed = -host.args.jumpForce;
				}
				else
				{
					host.args.ySpeed = -host.args.jumpForce + Math.max(leaving.args.ySpeed,0);
				}
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
			this.applyImpulse(host);
		}

		if(host.args.ignore === -2 && (host.args.falling === false || host.args.ySpeed > 64))
		{
			host.args.ignore = 0;
		}

		if(host.args.ignore === -3 && (!host.args.falling || host.args.ySpeed >= -10))
		{
			host.viewport.onFrameOut(1, () => host.args.ignore = 0);
		}

		if(host.args.ignore === -4 && !host.args.falling)
		{
			host.args.ignore = 30;
		}

		if(host.args.ignore < 1 && host.args.ignore > 0)
		{
			host.args.ignore = 0;
		}

		if(host.args.ignore > 0)
		{
			host.args.ignore--;
		}

		if(host.args.cameraIgnore > 0)
		{
			host.args.cameraIgnore--;
		}

		if(host.args.mercy > 0)
		{
			host.args.mercy--;
		}

		if(host.args.startled > 0)
		{
			host.args.startled--;
		}

		if(host.args.antiSkid > 0)
		{
			host.args.antiSkid--;
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
				host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));

				if(host.args.jumping && host.args.jumpedAt < host.args.y)
				{
					host.args.deepJump = true;
				}
				else if(host.args.jumping && host.args.jumpedAt > host.args.y + 160)
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

		let gSpeedMax = host.args.gSpeedMax;

		let regions = new Set;

		if(!host.isRegion)
		{
			if(!host.noClip)
			{
				regions = host.viewport.regionsAtPoint(host.args.x, host.args.y);

				for(const region of host.regions)
				{
					region.updateActor(host);
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

					region.enter(host);
				}
			}

			for(const region of host.regions)
			{
				if(!regions.has(region))
				{
					host.regions.delete(region);

					host.crossRegionBoundary(region, false);

					region.leave(host);
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

			let jumpBlock = host.getMapSolidAt(host.args.x + headPoint[0], host.args.y + headPoint[1]);

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
			const regionsBelow = (host.controllable || host.args.pushed || host.isVehicle) ? host.viewport.regionsAtPoint(groundPoint[0], groundPoint[1]+1) : [];
			const standingOn   = host.getMapSolidAt(...groundPoint) || ((host.controllable && host.args.groundAngle)
				? host.getMapSolidAt(groundPoint[0], groundPoint[1]+1)
				: false
			);

			if(!host.args.dead && !host.isRegion && host.args.mode === MODE_FLOOR && regionsBelow.size)
			{
				let falling = !standingOn;

				if(!host.args.falling || host.broad)
				for(const region of regionsBelow)
				{
					if(host.broad || (
						!Math.round(host.args.ySpeed)
						&& (Math.round(host.args.y) === region.args.y - region.args.height
							|| Math.round(host.args.y + 1) === region.args.y - region.args.height
							|| Math.round(host.args.y + 2) === region.args.y - region.args.height
						)
					)){
						if(region.skimSpeed < Infinity
							&& (host.broad || Math.max(Math.abs(host.args.gSpeed), Math.abs(host.args.xSpeed)) >= region.skimSpeed)
						){
							const speed = host.args.falling ? Math.abs(host.args.xSpeed) : Math.abs(host.args.gSpeed);

							host.args.gSpeed = speed * Math.sign(host.args.gSpeed || host.args.xSpeed);

							if(host.args.y - 32 < region.args.y - region.args.height)
							{
								if(host.broad)
								{
									host.args.falling = false;
								}

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

				if(standingOn instanceof Layer)
				{
					host.args.standingOn = standingOn;
				}
				else
				{
					host.args.falling = host.args.falling || falling;
				}

				// host.args.falling = falling || host.args.falling;
				// host.args.falling = host.args.ySpeed <= 0 ? falling : host.args.falling;

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
			else if(!host.noClip && !host.args.climbing && !host.args.xSpeed && !host.args.ySpeed && !host.args.float)
			{
				host.args.falling = !host.args.float && !this.checkBelow(host) || host.args.falling;
			}

			if(!host.args.static && !host.noClip && host.args.falling)
			{
				host.args.mode    = MODE_FLOOR;
				host.args.gSpeed  = 0;
			}

			if(!host.willStick && host.args.falling && !host.args.static && !host.noClip)
			{
				let popOut = 16;

				const radius = host.args.width * 0.5;

				while(host.getMapSolidAt(host.args.x - radius, host.args.y - host.args.height * 0.5)
					&& !host.getMapSolidAt(host.args.x + radius, host.args.y - host.args.height * 0.5)
					&& popOut > 0
				){
					host.args.x += 1;
					popOut--;
				}

				while(host.getMapSolidAt(host.args.x + radius, host.args.y - host.args.height * 0.5)
					&& !host.getMapSolidAt(host.args.x - radius, host.args.y - host.args.height * 0.5)
					&& popOut > 0
				){
					host.args.x -= 1;
					popOut--;
				}
			}

			if(!host.viewport)
			{
				return;
			}

			if(host.noClip || (!host.isRegion && !host.isEffect && host.args.falling && host.viewport))
			{
				if(host.args.grinding)
				{
					host.args.grinding = false;
				}

				// host.args.mode    = MODE_FLOOR;
				// host.args.gSpeed  = 0;
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
						host.args.flying = false;
					}
				}

				host.args.animationBias = Math.abs(host.args.airSpeed / host.args.flySpeedMax);

				if(host.args.animationBias > 1)
				{
					host.args.animationBias = 1;
				}

				if(!host.args.canHide && !host.noClip)
				{
					let popOut = 16;

					while(!host.args.static
						&& host.args.mode === 0
						&& !host.getMapSolidAt(host.args.x, host.args.y - host.args.height, host.args.layer, 0)
						&& host.getMapSolidAt(host.args.x, host.args.y - 1, host.args.layer, 0)
					){
						if(--popOut <= 0)
						{
							return;
						}

						host.args.y--;
					}
				}
			}
			else if(!host.args.static && (!host.noClip || host.args.standingLayer || (!host.isRegion && !host.isEffect && !host.args.falling)))
			{
				if(host.args.mode === 0 && host.groundTime <= 1)
				{
					host.args.gSpeed = host.args.xSpeed || host.args.gSpeed;
				}

				host.args.xSpeed = 0;
				host.args.ySpeed = 0;
				host.xLast = host.args.x;
				host.yLast = host.args.y;

				if(host.args.grinding && !host.args.gSpeed && host.args.modeTime > 4)
				{
					host.args.gSpeed = Math.sign(host.args.direction || host.axis || host.xSpeedLast || host.gSpeedLast || 0);
				}

				if(!host.args.canHide && !host.noClip)
				{
					let popOut = 16;

					while(!host.args.static
						&& host.args.mode === 0
						&& host.getMapSolidAt(host.args.x, host.args.y - 1)
					){
						if(--popOut <= 0)
						{
							return;
						}

						host.args.y--;
					}
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

		if(!host.isGhost && !host.isStatic && !host.isRegion && !(skipChecking.some(x => host instanceof x)))
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

			collisions.forEach(x => x.args !== host.args && !(host.args.static && x.args.static) && !x.isPushable && x.callCollideHandler(host));
		}

		if(!host.viewport)
		{
			return;
		}

		const tileMap = host.viewport.tileMap;

		if((host.args.pushing || Math.abs(host.args.gSpeed) < 2) && !host.args.falling)
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
				else if(mode === MODE_LEFT && (host.args.groundAngle < Math.PI * 0.05))
				{
					host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));

					// host.args.xSpeed = 2;

					host.args.mode = MODE_FLOOR
					host.args.falling = true;

					if(host.args.rolling)
					{
						host.args.x += host.args.width;
						host.args.y += host.args.height;
						host.args.ySpeed = host.args.gSpeed;
						host.args.float = 1;
					}
					else
					{
						host.args.groundAngle = -Math.PI / 2;
						host.args.x++;
					}

					host.args.cameraIgnore = 30;
					host.args.ignore = -4;

				}
				else if(mode === MODE_RIGHT && (host.args.groundAngle > -Math.PI * 0.05))
				{
					host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));

					// host.args.xSpeed = -2;

					host.args.mode = MODE_FLOOR
					host.args.falling = true;

					if(host.args.rolling)
					{
						host.args.x -= host.args.width;
						host.args.y += host.args.height;
						host.args.ySpeed = -host.args.gSpeed;
						host.args.float = 1;
					}
					else
					{
						host.args.groundAngle = Math.PI / 2;
						host.args.x--;
					}

					host.args.cameraIgnore = 30;
					host.args.ignore = -4;
				}
				else if(mode === MODE_CEILING)
				{
					host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));

					host.args.xSpeed = 0;

					host.args.y++;
					host.args.falling = true;
					host.willJump = false;

					const gSpeed = host.args.gSpeed;

					host.args.groundAngle = Math.PI;
					host.args.mode = MODE_FLOOR;

					host.viewport.onFrameOut(1, () => {
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
							// host.args.x++;
						}
						else if(Math.sign(host.xSpeedLast) === 1)
						{
							host.args.direction = 1;
							host.args.facing = 'right'
							// host.args.x--;
						}
					}

					host.args.cameraIgnore = 30;
					host.args.ignore = -2;
				}
			}
		}

		host.args.landed = true;

		if(host.controllable)
		{
			host.args.x = (host.args.x);
			host.args.y = (host.args.y);
		}

		host.controllable && host.processInput();

		if(host.args.falling || host.args.gSpeed)
		{
			host.args.stopped = 0;
		}
		else
		{
			host.args.stopped++;
		}

		if(host.args.falling)
		{
			host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));
		}
		else if(host.lastAngles.length > 0)
		{
			host.args.groundAngle = host.lastAngles.map(a=>Number(a)).reduce(((a,b)=>a+b)) / host.lastAngles.length;
		}

		if(isNaN(host.args.groundAngle))
		{
			console.log(host.lastAngles, host.lastAngles.length);
		}

		if(!host.args.float && !host.args.static && !host.noClip)
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
						if(!groundActor.isVehicle && host.args.y > 1 + groundActor.args.y + -groundActor.args.height)
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
			else if(host.args.standingOn && !host.args.standingOn.isVehicle)
			{
				host.args.standingOn = null;
			}
		}

		if(!host.args.static && !host.isRegion && !host.noClip && !host.args.xSpeed && !host.args.ySpeed && this.checkBelow(host, host.args.x, host.args.y))
		{
			host.args.falling = false;
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
			if(host.viewport && host.viewport.args.frameId % host.viewport.settings.frameSkip === 0)
			{
				host.twister.args.x = host.args.x;
				host.twister.args.y = host.args.y;
			}

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
			if(host.viewport && host.viewport.args.frameId % host.viewport.settings.frameSkip === 0)
			{
				host.pincherBg.args.x = host.args.x;
				host.pincherBg.args.y = host.args.y;
			}

			host.pincherBg.args.xOff = host.args.xOff;
			host.pincherBg.args.yOff = host.args.yOff;

			host.pincherBg.args.width  = host.args.width;
			host.pincherBg.args.height = host.args.height;
		}

		if(host.pincherFg)
		{
			if(host.viewport && host.viewport.args.frameId % host.viewport.settings.frameSkip === 0)
			{
				host.pincherFg.args.x = host.args.x;
				host.pincherFg.args.y = host.args.y;
			}

			host.pincherFg.args.xOff = host.args.xOff;
			host.pincherFg.args.yOff = host.args.yOff;

			host.pincherFg.args.width  = host.args.width;
			host.pincherFg.args.height = host.args.height;
		}

		if(host.args.falling)
		{
			host.groundTime = 0;
			host.idleTime = 0;
			host.args.rolling = false;
			host.fallTime++;
		}
		else
		{
			host.groundTime++;
			host.idleTime++;

			if(host.yAxis || host.xAxis)
			{
				host.idleTime = 0;
			}
		}

		host.args.carrying = !!host.carrying.size;

		if(host.args.carrying)
		{
			if(Math.abs(host.args.gSpeed) > 8)
			{
				host.args.gSpeed = 8 * Math.sign(host.args.gSpeed);
			}

			host.idleTime = 0;
			host.args.rolling = false;
		}
	}

	applyImpulse(host)
	{
		if(host.args.dead)
		{
			return;
		}

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
			// const scanDist  = radius + Math.abs(host.args.gSpeed);
			const direction = Math.sign(host.args.gSpeed || host.args.direction);

			const max  = Math.abs(host.args.gSpeed);
			const step = 1;

			host.pause(true);

			let iter = 0

			const dirs = [0,0,Math.PI];
			const filterBlockers = x =>
				x.args !== host.args
				&& x.callCollideHandler(host)
				&& x.solid;

			for(let s = 0; s < max; s += step)
			{
				if(host.args.height > 8 && host.args.modeTime > 1)
				{
					if(!host.args.gSpeed)
					{
						host.args.pushing = false;
					}

					const headPoint = host.rotatePoint(
						radius * -direction
						, host.args.height
					);

					let headBlock = host.getMapSolidAt(host.args.x + headPoint[0], host.args.y + headPoint[1]);

					if(Array.isArray(headBlock))
					{
						headBlock = headBlock.filter(filterBlockers).length;
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
					else
					{
						host.args.pushing = false;
					}

					let waistBlock = false;

					if(!host.noClip && host.controllable && host.args.groundAngle === 0)
					{
						const waistPoint = host.rotatePoint(-radius * Math.sign(host.args.gSpeed), host.args.height * 0.5);

						waistBlock = host.getMapSolidAt(host.args.x + waistPoint[0], host.args.y + waistPoint[1])
						if(Array.isArray(waistBlock))
						{
							waistBlock = waistBlock.filter(filterBlockers).length || false;
						}

						if(waistBlock !== false && waistBlock <= radius)
						{
							if(host.args.mode === MODE_CEILING)
							{
								host.args.x += radius * Math.sign(host.args.gSpeed);
								host.args.y += host.args.rollingeight || host.args.height;

								host.args.mode = MODE_FLOOR;
								host.args.gSpeed = 0;
							}
							else if(host.args.mode === MODE_FLOOR)
							{
								host.args.gSpeed = Math.min(1,waistBlock) * Math.sign(host.args.gSpeed);
							}

							host.args.gSpeed && (host.args.pushing = Math.sign(host.args.gSpeed));
							break;
						}
					}

					// if(!headBlock && !waistBlock)
					// {
					// 	host.args.pushing = 0;
					// }
				}

				for(const behavior of host.behaviors)
				{
					behavior.movedGround && behavior.movedGround(host);
				}

				if(host.args.falling || host.locked)
				{
					return;
				}

				nextPosition = this.findNextStep(host, step * direction);

				if(!nextPosition)
				{
					break;
				}

				if(nextPosition[3])
				{
					host.args.moving = false;
					host.args.gSpeed = 0.15 * Math.sign(host.args.gSpeed);

					// if(host.args.mode === MODE_LEFT || host.args.mode === MODE_RIGHT)
					// {
					// 	host.args.mode = MODE_FLOOR;
					// 	host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));
					// }

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

							// if(headBlock)
							// {
							// 	host.args.x += (headBlock - host.args.width) * Math.sign(gSpeed);
							// }
							// else

							const stepsLeft   = Math.max(1, Math.abs(gSpeed) - Math.abs(this.stepsTaken));
							const impulseLeft = stepsLeft * Math.sign(gSpeed);

							if(0&&stepsLeft < radius)
							{
								host.args.x += (radius - stepsLeft) * Math.sign(gSpeed);
							}
							else
							{
								host.args.x +=  impulseLeft * Math.cos(gAngle);
								host.args.y += -impulseLeft * Math.sin(gAngle);
							}

							host.args.xSpeed =  gSpeed * Math.cos(gAngle);
							host.args.ySpeed = -gSpeed * Math.sin(gAngle);

							host.args.float = host.args.float < 0 ? host.args.float : 1;

							let falling = !!host.args.gSpeed;

							if(this.checkBelow(host, host.args.x, host.args.y))
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
							host.args.y++;

							host.args.float = host.args.float < 0 ? host.args.float : 1;

							host.args.falling = true;

							// host.args.groundAngle  = Math.PI;
							// host.args.displayAngle = Math.PI;

							host.args.mode   = MODE_FLOOR;
							host.args.xSpeed = -gSpeed * Math.cos(gAngle);
							host.args.ySpeed =  gSpeed * Math.sin(gAngle);

							host.args.x += -gSpeed * Math.cos(gAngle);
							host.args.y +=  gSpeed * Math.sin(gAngle);

							host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(0));
							host.args.direction *= -1;

							if(!host.args.rolling && !host.args.grinding)
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
										// host.args.x -= host.args.direction;
										// host.args.y -= hRadius * Math.sign(host.args.gSpeed);
										// host.args.y -= host.args.gSpeed + -2;
										// host.args.groundAngle = 0;
									}
									else
									{
										host.args.x += radius;
									}
								}
								else
								{
									host.args.ignore = -3;
									host.args.x += host.controllable ? radius : 1;
									// host.args.y += hRadius;
								}

								host.args.xSpeed = gSpeed * Math.sin(gAngle);
								host.args.ySpeed = gSpeed * Math.cos(gAngle);

								host.args.x += gSpeed * Math.sin(gAngle);
								host.args.y += gSpeed * Math.cos(gAngle);

								if(host.isVehicle || (!host.args.rolling && !host.args.grinding))
								{
									host.args.groundAngle = -Math.PI * 0.5;
								}
								else
								{
									host.args.x += radius;
								}

								host.args.mode = MODE_FLOOR;
								host.args.cameraIgnore = 30;

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
								if(Math.abs(host.args.gSpeed) < 3 && !host.args.rolling)
								{
									if(host.args.gSpeed > 0)
									{
										// host.args.x -= host.args.direction;
										// host.args.y -= hRadius * Math.sign(host.args.gSpeed);
										// host.args.y -= host.args.gSpeed + 2;
										// host.args.groundAngle = 0;
									}
									else
									{
										host.args.x -= radius;
									}
								}
								else
								{
									host.args.ignore = -3;
									host.args.x -= host.controllable ? radius : 1;
									// host.args.y += hRadius;
								}

								host.args.xSpeed = -gSpeed * Math.sin(gAngle);
								host.args.ySpeed = -gSpeed * Math.cos(gAngle);

								host.args.x += -gSpeed * Math.sin(gAngle);
								host.args.y += -gSpeed * Math.cos(gAngle);

								if(host.isVehicle || (!host.args.rolling && !host.args.grinding))
								{
									host.args.groundAngle = Math.PI * 0.5;
								}
								else
								{
									host.args.x -= radius;
								}

								host.args.mode = MODE_FLOOR;
								host.args.cameraIgnore = 30;

								// host.onNextFrame(() => {
								// });

							}

							// host.args.mode = MODE_FLOOR;
							host.args.falling = true;

							break;
					}

					// host.args.gSpeed = 0;

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

					if(!host.keepAngle)
					{
						host.args.angle = nextPosition[0]
							? (Math.atan(nextPosition[1] / nextPosition[0]))
							: (Math.sign(nextPosition[1]) * Math.PI / 2);

						host.lastAngles.unshift(host.args.angle);

						host.lastAngles.splice(host.angleAvg);
					}
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
				else
				{
					host.args.x += nextPosition[0];
					host.args.y -= nextPosition[1];
				}
			}

			if(host.args.pushing)
			{
				host.args.gSpeed = Math.sign(host.args.gSpeed);
			}

			const hRadius = Math.round(host.args.height / 2);

			let popOut = 16;

			if(!host.args.static && host.args.mode === MODE_FLOOR)
			{
				while((host.args.gSpeed <= 0 || host.args.modeTime < 3)
					&& host.getMapSolidAt(host.args.x - radius, host.args.y - hRadius, false)
					&& popOut > 0
				){
					// host.args.direction = 0;
					// host.args.gSpeed = 0;
					host.args.x++;
					popOut--;
				}

				while((host.args.gSpeed >= 0 || host.args.modeTime < 3)
					&& host.getMapSolidAt(host.args.x + radius, host.args.y - hRadius, false)
					&& popOut > 0
				){
					// host.args.direction = 0;
					// host.args.gSpeed = 0;
					host.args.x--;
					popOut--;
				}
			}

			wasPaused || host.pause(false);

			const pushFoward = host.xAxis && (Math.sign(host.xAxis) === Math.sign(host.args.gSpeed));
			const friction   = host.getLocalFriction();

			if(host.args.mode === MODE_FLOOR
				|| host.args.mode === MODE_CEILING
				|| (host.args.gSpeed < 0 && host.args.mode === MODE_LEFT)
				|| (host.args.gSpeed > 0 && host.args.mode === MODE_RIGHT)
			){

				const pushBack = host.xAxis && (Math.sign(host.xAxis) !== Math.sign(host.args.gSpeed));

				const decel = friction * host.args.decel * ((host.args.rolling && pushBack) ? 3 : 0.75);

				if(!host.args.climbing && host.args.gSpeed && (!pushFoward || host.args.rolling))
				{
					if(host.args.sliding)
					{

					}
					else if(host.args.grinding)
					{
						if(Math.abs(host.yAxis) > 0.5)
						{
							// host.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(host.args.gSpeed);
						}
						else
						{
							host.args.gSpeed -= decel * 1/drag * 0.125 * Math.sign(host.args.gSpeed);
						}

						if(Math.abs(host.args.gSpeed) > 40)
						{
							host.args.gSpeed = 40 * direction;
						}
					}
					else if(host.args.rolling)
					{
						host.args.gSpeed -= decel * 1/drag * 0.06125 * Math.sign(host.args.gSpeed);
					}
					else if(!host.args.grinding && !host.args.rolling && (!host.xAxis || (pushBack && Math.abs(host.args.gSpeed) > 6)))
					{
						const step = decel * 1/drag * Math.sign(host.args.gSpeed);

						if(Math.abs(host.args.gSpeed) > Math.abs(step))
						{
							host.args.gSpeed -= step;
						}
						else
						{
							host.args.gSpeed = 0;
						}
					}

					if(Math.abs(host.args.gSpeed) < 0.1 || (pushBack && Math.abs(host.args.gSpeed) < 1))
					{
						host.args.gSpeed = 0;
					}
				}
			}

			// if(!pushFoward && Math.abs(host.args.gSpeed) < 1)
			// {
			// 	if(!host.args.climbing && !host.args.wallSticking)
			// 	{
			// 		// host.args.gSpeed = 0;
			// 	}
			// }

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

					// const direction = Math.sign(host.args.gSpeed || host.xSpeedLast || 1);
					const direction = Math.sign(host.args.gSpeed);

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
						if(host.args.gSpeed || Math.abs(slopeFactor) > 0.25)
						{
							host.args.gSpeed += 0.60 * slopeFactor * direction;
						}

						if(Math.abs(host.args.gSpeed) < 1)
						{
							host.args.gSpeed = (1 + slopeFactor**2) * Math.sign(host.args.gSpeed);
						}

						const regions = (host.controllable || host.args.pushed || host.isVehicle) ? host.viewport.regionsAtPoint(host.args.x, host.args.y) : [];

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

						if(Math.abs(slopeFactor) > 0.25
							&& Math.abs(host.args.gSpeed) < 2
							&& Math.abs(Math.sign(host.args.gSpeed) - Math.sign(direction)) < 2
						){
							host.args.gSpeed = 2 * direction;
						}
					}
					else if(slopeFactor < -0.30 || (slopeFactor < 0 && host.args.gSpeed))
					{
						if(Math.abs(host.args.gSpeed) < 10)
						{
							const slopeVector = slopeFactor * direction;

							if(host.args.gSpeed || slopeFactor < -0.075)
							{
								if(Math.sign(slopeVector) === Math.sign(host.args.gSpeed))
								{
									host.args.gSpeed += 1.65 * slopeFactor * direction;
								}
								else
								{
									host.args.gSpeed += 0.25 * slopeFactor * direction;
								}
							}
						}
						else
						{
							host.args.gSpeed += 0.65 * slopeFactor * direction;
						}
					}
				}
				else if(!host.stayStuck)
				{
					if(slopeFactor > 0.25)
					{
						if(Math.abs(host.args.gSpeed) < host.args.gSpeedMax * 2)
						{
							host.args.gSpeed += 0.125 * slopeFactor * direction;

							if(Math.abs(host.args.gSpeed) < 2 && Math.abs(Math.sign(host.args.gSpeed) - Math.sign(direction)) < 2)
							{
								host.args.gSpeed = 2 * direction;
							}
						}
					}
					else if(slopeFactor < -0.075)
					{
						const originalSign = Math.sign(host.args.gSpeed);

						if(Math.abs(host.args.gSpeed) < 10)
						{
							host.args.gSpeed += 0.30 * slopeFactor * direction;
						}
						else
						{
							// host.args.gSpeed += 0.15 * slopeFactor * direction;
						}

						if(Math.sign(host.args.gSpeed) !== originalSign)
						{
							host.args.ignore = host.args.ignore || 5;

							host.args.antiSkid = 10;

							host.args.gSpeed += Math.sign(host.args.gSpeed) * 0.5;
						}
					}
					else if(slopeFactor > 0 && friction < 0.75)
					{
						if(Math.abs(host.args.gSpeed) < 1)
						{
							host.args.gSpeed = direction;
						}

						host.args.gSpeed += direction * slopeFactor;
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
				// host.args.gSpeed = 0;
			}
		}

		host.args.heading = Math.sign(host.args.gSpeed);

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

	// findAirPointA(i, point, actor)
	// {
	// 	if(!actor.viewport)
	// 	{
	// 		return;
	// 	}

	// 	const viewport = actor.viewport;
	// 	const tileMap  = viewport.tileMap;

	// 	const actors = viewport.actorsAtPoint(point[0], point[1])
	// 		.filter(x =>
	// 			x.args !== actor.args
	// 			&& x.callCollideHandler(actor)
	// 			&& x.solid
	// 		);

	// 	if(actors.length > 0)
	// 	{
	// 		return actor.lastPointA;
	// 	}

	// 	const solid = tileMap.getSolid(point[0], point[1], actor.args.layer);

	// 	if(solid)
	// 	{
	// 		return actor.lastPointA;
	// 	}

	// 	Object.assign(actor.lastPointA, point.map(Math.trunc));
	// }

	// findAirPointB(i, point, actor)
	// {
	// 	if(!actor.viewport)
	// 	{
	// 		return;
	// 	}

	// 	const viewport = actor.viewport;
	// 	const tileMap  = viewport.tileMap;

	// 	const actors = viewport.actorsAtPoint(point[0], point[1])
	// 		.filter(x =>
	// 			x.args !== actor.args
	// 			&& x.callCollideHandler(actor)
	// 			&& x.solid
	// 		);

	// 	if(actors.length > 0)
	// 	{
	// 		return actor.lastPointB;
	// 	}

	// 	if(tileMap.getSolid(point[0], point[1], actor.args.layer))
	// 	{
	// 		return actor.lastPointB;
	// 	}

	// 	Object.assign(actor.lastPointB, point.map(Math.trunc));
	// }

	updateAirPosition(host)
	{
		const xSpeedOriginal = host.args.xSpeed;
		const ySpeedOriginal = host.args.ySpeed;

		const originalAngle = host.airAngle;

		host.args.standingLayer = null;

		const viewport  = host.viewport;
		const radius    = Math.ceil(host.args.width / 2);
		const direction = Math.sign(host.args.xSpeed);

		const tileMap = host.viewport.tileMap;

		const airSpeed  = Math.hypot(host.args.xSpeed, host.args.ySpeed);

		host.args.airSpeed = airSpeed;

		if(!airSpeed)
		{
			return;
		}

		if(host.fallTime > 8 && (host.controllable || host.isVehicle))
		{
			let spinBack = 20;

			if(host.springing)
			{
				spinBack = 125;
			}

			host.args.groundAngle += -Math.sign(host.args.groundAngle) * 0.001 * spinBack;
		}

		if(Math.abs(host.args.groundAngle) < 0.08)
		{
			host.args.groundAngle = 0;
		}

		if(host.noClip)
		{
			if(host.args.falling)
			{
				host.xLast = host.args.x;
				host.yLast = host.args.y;

				host.args.x += host.args.xSpeed;
				host.args.y += host.args.ySpeed;
			}

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

		const upScanDist = host.args.ySpeed < 0
			? (-host.args.ySpeed + upMargin)
			: 0;

		// const upDistanceL = host.castRay(
		// 	upScanDist
		// 	, -Math.PI / 2
		// 	, [-host.args.width/2 , 0]
		// 	, host.findSolid
		// );

		// const upDistanceR = host.castRay(
		// 	upScanDist
		// 	, -Math.PI / 2
		// 	, [host.args.width/2, 0]
		// 	, host.findSolid
		// );

		// window.logPoints = upScanDist && true;

		// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'up-l-scan '+label);

		const upDistanceL = host.castRayQuick(
			upScanDist
			, -Math.PI / 2
			, [host.args.width * -0.5, 0]
		);

		// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'up-r-scan '+label);

		const upDistanceR = host.castRayQuick(
			upScanDist
			, -Math.PI / 2
			, [host.args.width * 0.5, 0]
		);

		// window.logPoints = false;

		// if(upDistanceL !== upDistanceLQ || upDistanceR !== upDistanceRQ)
		// {
		// 	console.log(upDistanceL - upDistanceLQ, upDistanceR - upDistanceRQ);
		// 	console.log(321);
		// }

		const upDistance = (upDistanceL || upDistanceR)
			? Math.min(...[upDistanceL, upDistanceR].filter(x => x !== false))
			: false;

		host.upScan = false;

		let hits = [], distances = [];

		if(!host.args.hLock && !host.noClip)
		{
			const hScanDist = (host.args.xSpeed);
			const rotScale  = Math.abs(host.args.groundAngle) > Math.PI * 0.5 ? Math.cos(host.args.groundAngle) : 1;

			const foreDistanceHead  = hScanDist ? this.scanForward(host, hScanDist, 0.9 * rotScale) : false;
			const foreDistanceWaist = hScanDist ? this.scanForward(host, hScanDist, 0.5 * rotScale) : false;
			const foreDistanceFoot  = hScanDist ? this.scanForward(host, hScanDist, 0.1 * rotScale) : false;

			distances = [foreDistanceHead, foreDistanceWaist, foreDistanceFoot];

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
		// const xMove = host.xLast - host.args.x;

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

		if(host.args.ySpeed >= 0
			&& distances[2]
			&& distances[2] <=  host.args.width * 0.5
			&& distances[1] === false
			&& distances[0] === false
		){
			const dir = Math.sign(xSpeedOriginal);

			if(!host.getMapSolidAt(host.args.x + host.args.width * 0.5 * dir, host.args.y + 4))
			{
				host.args.x += dir * Math.abs(distances[2]);

				while(host.getMapSolidAt(host.args.x + host.args.width * 0.5 * dir, host.args.y))
				{
					host.args.y--;
				}

				host.args.falling = false;
				host.args.gSpeed = host.args.xSpeed;
				return;
			}
		}
		else if(!host.willStick && (hits.length > 1 || distances[2])
			// && (upDistance === false || upDistance < (host.args.height + -host.args.ySpeed))
		){
			const xDirection = Math.sign(xSpeedOriginal);

			const minHit = -1 + Math.min(...hits);

			const width   = host.args.width;
			const radius  = 0.5 * width;
			// const shiftBy = width + -minHit;
			const shiftBy = radius + -minHit;
			const shift = shiftBy * -xDirection;

			// if(!isNaN(shift) && (!shift || Math.abs(shiftBy) < width || Math.sign(shift) !== Math.sign(host.args.xSpeed)))
			if(!isNaN(shift) && (!shift || Math.abs(shiftBy) < radius || Math.sign(shift) !== Math.sign(host.args.xSpeed)))
			{
				host.args.x += shift;

				host.args.flySpeed = 0;
				host.args.xSpeed   = 0;
				host.args.gSpeed   = 0;
				host.args.mode     = MODE_FLOOR;
			}

			host.viewport && host.viewport.actorsAtPoint(
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

		// Object.assign(host.lastPointA, [host.args.x, host.args.y].map(Math.trunc));
		// Object.assign(host.lastPointB, [host.args.x, host.args.y].map(Math.trunc));

		const scanDist = airSpeed;

		// const airPointP = host.castRay(
		// 	scanDist
		// 	, host.airAngle
		// 	, this.findAirPointA
		// );

		// const airPointBP = host.rotateLock
		// 	? airPoint
		// 	: host.castRay(
		// 		scanDist
		// 		, host.airAngle
		// 		, [0, -3 * Math.sign(host.args.ySpeed || 1)]
		// 		, this.findAirPointB
		// 	);

		const tiny = 1;

		let airMag = host.castRayQuick(
			scanDist
			, originalAngle
		);

		// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'main-scan '+label);

		airMag = airMag !== false ? airMag : host.castRayQuick(
			scanDist
			, originalAngle
			, [-tiny, 0]
		);

		airMag = airMag !== false ? airMag : host.castRayQuick(
			scanDist
			, originalAngle
			, [+tiny, 0]
		);

		// if(airMag && Math.abs(host.args.xSpeed) < Math.abs(host.args.ySpeed))
		// {
		// 	airMag -= Math.abs(Math.sin(originalAngle));
		// }
		// else if(airMag && Math.abs(host.args.xSpeed) > Math.abs(host.args.ySpeed))
		// {
		// 	airMag -= Math.abs(Math.cos(originalAngle));
		// }

		const airPointQ = airMag !== false && [
			Math.cos(originalAngle) * airMag + host.args.x
			, Math.sin(originalAngle) * airMag + host.args.y
		];

		let airPointBQ = airPointQ;

		if(!host.rotateLock)
		{
			// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'alt-scan '+label);

			const bOffset = -3 * Math.sign(host.args.ySpeed || 1);

			const airMag = host.castRayQuick(
				scanDist
				, originalAngle
				, [0, bOffset]
			);

			airPointBQ = airMag !== false ? [
				Math.cos(originalAngle) * airMag + host.args.x
				, Math.sin(originalAngle) * airMag + host.args.y + bOffset
			] : airPointBQ;
		}

		// window.logPoints = false;

		const airPoint   = airPointQ;
		const airPointB = airPointBQ;

		host.willJump = false;

		let blockers = false;

		let collisionAngle = false;

		if(![airPoint, airPointB].some(x => x === false))
		{
			collisionAngle = Math.atan2(airPoint[1] - airPointB[1], airPoint[0] - airPointB[0]);
		}

		if(host.xLast !== host.args.x)
		{
			host.xLast = host.args.x;
		}

		if(host.yLast !== host.args.y)
		{
			host.yLast = host.args.y;
		}

		if(airPoint !== false)
		{
			let angleIsWall = false;

			if(xSpeedOriginal < 0)
			{
				const angle = Math.abs(collisionAngle - Math.PI/2) % Math.PI;
				angleIsWall = Math.abs(airPoint[1] - airPointB[1]) > 1
					&& airPoint[0] >= (-1+airPointB[0])
					&& angle < Math.PI/4;
			}

			if(xSpeedOriginal > 0)
			{
				const angle = Math.abs(collisionAngle - Math.PI/2) % Math.PI;
				angleIsWall = Math.abs(airPoint[1] - airPointB[1]) > 1
					&& airPoint[0] <= (+1+airPointB[0])
					&& angle < Math.PI/4;
			}

			const isLeft  = angleIsWall && xSpeedOriginal < 0;
			const isRight = angleIsWall && xSpeedOriginal > 0;

			const solid = this.checkBelow(host, airPoint[0], airPoint[1] + 1);

			if(!host.willStick && (host.args.mode === 0 && !angleIsWall))
			{
				// host.args.gSpeed = xSpeedOriginal || host.args.gSpeed;
				host.args.gSpeed = host.args.xSpeed;

				if(solid && typeof solid === 'object')
				{
					if(solid.args && solid.args.treadmill)
					{
						host.args.gSpeed = 0;
					}
					else if(solid.offsetXChanged)
					{
						host.args.gSpeed -= solid.offsetXChanged;
					}
				}
			}
			else
			{
				airPoint[0] = Math.round(airPoint[0]);
				airPoint[1] = Math.round(airPoint[1]);
			}

			if(host.willStick)
			{
				airPoint[0] = Math.round(airPoint[0]);
				airPoint[1] = Math.round(airPoint[1]);
			}

			const stickX = airPoint[0];
			const stickY = airPoint[1];

			// let away = false;

			// if(!host.args.ySpeed || Math.sign(stickY - host.args.y) === Math.sign(host.args.ySpeed))
			// {
			// 	// host.args.xSpeed = 0;
			// 	// host.args.ySpeed = 0;

			// 	// if(host.args.flying && !angleIsWall && collisionAngle)
			// 	// {
			// 	// 	host.args.mode = MODE_CEILING;
			// 	// 	host.args.xSpeed *= -1;
			// 	// }
			// }
			// else
			// {
			// 	// host.args.y++;
			// 	away = true;
			// }

			// if(!host.viewport.tileMap.getSolid(stickX, stickY))
			// {
			// }

			if(host.removed)
			{
				return;
			}

			host.args.x = Math.round(stickX);
			host.args.y = Math.round(stickY);

			if(angleIsWall && !host.willStick)
			{
				host.args.x -= host.args.width * 0.5 *  Math.sign(xSpeedOriginal);
				host.args.falling = true;
				if(hits.length > 2)
				{
					host.args.xSpeed = 0;
				}
			}

			blockers = host.getMapSolidAt(host.args.x + direction, host.args.y);

			if(Array.isArray(blockers))
			{
				blockers = blockers.filter(a => a.callCollideHandler(host) !== false);

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
					host.args.groundAngle = 0;

					host.args.direction = 1;
					host.args.facing = 'right';
				}
				else if(upCollisionAngle !== false && upCollisionAngle > 0)
				{
					host.args.gSpeed = 0;
					host.args.mode = MODE_RIGHT;
					host.args.groundAngle = 0;

					host.args.direction = -1;
					host.args.facing = 'left';
				}
				else if((host.willStick || (!isLeft && !isRight))
					&& !host.getMapSolidAt(host.args.x - direction, host.args.y)
					&& !host.getMapSolidAt(host.args.x - direction, host.args.y + 1)
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

			const xSpeed = Math.trunc(host.args.xSpeed);

			if(xSpeed > 0 && forePosition && forePosition[3])
			{
				host.args.x -= host.args.width;
			}
			else if(xSpeed < 0 && backPosition && backPosition[3])
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

					if(host.ySpeedLast < 0)
					{
						newAngle *= -1;
					}
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
				if(angleIsWall && !host.willStick)
				{

				}
				else if(Math.abs(newAngle) < (Math.PI/2 + -Math.PI/16)
					&& forePosition && backPosition
					&& forePosition[0] !== false && backPosition[0] !== false
					&& forePosition[1] !== false && backPosition[1] !== false
					&& !forePosition[2] && !backPosition[2]
					&& !(forePosition[3] && backPosition[3])
				){
					if(host.canRoll && (host.yAxis > 0.55 || host.args.dropDashCharge) && !host.carrying.size)
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

					const qPi = Math.PI * 0.25;
					const landAngle = newAngle;

					if(newAngle < -qPi)
					{
						host.args.mode = MODE_LEFT;
						newAngle += qPi;
					}
					else if(newAngle > qPi)
					{
						host.args.mode = MODE_RIGHT;
						newAngle -= qPi;
					}

					host.args.groundAngle = newAngle;
					host.lastAngles.splice(0, host.lastAngles.length, ...Array(host.angleAvg).fill(newAngle));
					// host.args.ignore = host.args.ignore || 5;

					const slopeDir = -landAngle / (Math.PI * 0.4);

					let gSpeed = 0;

					gSpeed += xSpeedOriginal;
					gSpeed += ySpeedOriginal * slopeDir;

					if(blockers && blockers.length)
					{
						gSpeed = 0;
					}

					if(host.args.mode % 2 == 1)
					{
						// gSpeed *=-1;
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

					if(gSpeed && (!host.args.standingOn || !host.args.standingOn.args.treadmill))
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
					&& host.args.ySpeed > 0
					&& ( (forePosition && forePosition[2] && (!backPosition || !backPosition[3]) )
						|| ( (!forePosition || !forePosition[3]) && backPosition && backPosition[2])
					)
				){
					// const speed = xSpeedOriginal || host.xSpeedLast;
					const speed = xSpeedOriginal;

					host.args.falling = false;
					host.args.gSpeed  = speed;

					// host.args.xSpeed = 0;
					// host.args.ySpeed = 0;

					host.args.float  = host.args.float || 1;

					host.args.x += forePosition[0];
					host.args.y -= forePosition[1];

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
				// host.args.gSpeed = Math.floor(xSpeedOriginal || host.xSpeedLast);
				host.args.gSpeed = Math.floor(xSpeedOriginal);
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

		if(!tileMap.getSolid(host.args.x + (host.args.width / 2) * Math.sign(host.args.xSpeed), host.args.y, host.args.layer))
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
					host.args.x + (1+radius) * Math.sign(host.args.xSpeed)
					, host.args.y - host.args.height / 2
				);

				const topTest = host.getMapSolidAt(
					host.args.x, host.args.y - host.args.height
				);

				if(!edgeTest)
				{
					host.args.x = Number(host.args.x) + Number(host.args.xSpeed);
				}

				if(topTest)
				{
					// host.args.ySpeed += topTest.yOffsetChanged;
					host.args.y += 1;
				}
			}

			if(host.args.ySpeed)
			{
				if(0)
				{
					host.args.y = Math.round(Number(host.args.y) + Number(host.args.ySpeed));
				}
				else
				{
					host.args.y = Number(host.args.y) + Number(host.args.ySpeed);
				}

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
			const groundTop = host.args.standingOn.args.y + -host.args.standingOn.args.height + -1;

			if(host.args.y < groundTop || host.args.ySpeed < 0)
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

			host.viewport.onFrameOut(1, ()=>{
				host.args.gSpeed += dropBoost
				host.args.rolling = true;
			});

			const viewport = host.viewport;

			const dustParticle = new Tag('<div class = "particle-dust">');

			const dustPoint = host.rotatePoint(host.args.gSpeed, 0);

			dustParticle.style({
				'--x': dustPoint[0] + host.args.x
				, '--y': dustPoint[1] + host.args.y
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

		if(actor.args.mode === MODE_FLOOR && actor.args.groundAngle === 0 && (actor.controllable || actor.args.pushed || actor.isVehicle))
		{
			const regions = actor.viewport.regionsAtPoint(point[0], point[1]);

			for(const region of regions)
			{
				if(-1 + point[1] === region.args.y + -region.args.height && Math.abs(actor.args.gSpeed) >= region.skimSpeed)
				{
					return -1 + i;
				}
			}
		}

		if(tileMap.getSolid(point[0], point[1], actor.args.layer))
		{
			return i;
		}

		const actors = viewport
		.actorsAtPoint(point[0], point[1])
		.filter(x =>
			x.args !== actor.args
			&& x.callCollideHandler(actor)
			&& x.solid
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
		const pointSolid = tileMap.getSolid(point[0], point[1], actor.args.layer);

		if(pointSolid)
		{
			return;
		}

		const actors = viewport
		.actorsAtPoint(point[0], point[1])
		.filter(x =>
			x.args !== actor.args
			&& x.callCollideHandler(actor)
			&& x.solid
		);

		if(actor.args.groundAngle <= 0)
		{
			const regions = (actor.controllable || actor.args.pushed || actor.isVehicle) ? actor.viewport.regionsAtPoint(point[0], point[1]) : [];

			for(const region of regions)
			{
				if(actors.length === 0 && !pointSolid)
				{
					if(actor.args.mode !== MODE_FLOOR
						|| point[1] !== 1 + region.args.y + -region.args.height
						|| Math.abs(actor.args.gSpeed) <= region.skimSpeed
					){
						return i;
					}
				}
			}
		}

		if(actors.length === 0)
		{
			if(!pointSolid)
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

		// if(host.stepCache[offset] !== undefined)
		// {
		// 	return host.stepCache[offset];
		// }

		const viewport = host.viewport;
		const tileMap  = viewport.tileMap;
		const maxStep  = host.maxStep * (host.args.falling ? 2 : 1);
		const radius   = Math.max(host.args.width / 2, 1);

		const sign = Math.sign(offset);

		let downFirstSolid = false;
		let upFirstSpace   = false;

		let prevUp = 0, prevDown = 0;

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

			// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'down-walk-solid ' + label);

			downFirstSolid = host.castRay(
				maxStep// * (1+col)
				, host.downAngle
				, offsetPoint
				, this.findDownSolid
			);

			// downFirstSolid = host.castRayQuick(
			// 	maxStep, host.downAngle, offsetPoint
			// );

			// window.logPoints = null;

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

				// window.logPoints = (x,y,label) => host.viewport.args.plot.addPoint(x,y,'up-walk-space ' + label);

				upFirstSpace = host.castRay(
					upLength
					, host.upAngle
					, offsetPoint
					, this.findUpSpace
				);

				// window.logPoints = null;

				const upDiff = Math.abs(prevUp - upFirstSpace);

				if(upFirstSpace === false)
				{
					return [false, false, false, true];
				}

				if(upDiff >= maxStep)
				{
					return [false, false, false, true];
				}

				prevUp = upFirstSpace;
			}
			else
			{
				prevDown = downFirstSolid;
			}

			this.stepsTaken++;

			// if(upFirstSpace !== false)
			// {
			// 	host.stepCache[col * sign] = [col * sign, upFirstSpace, false];
			// }
			// else
			// {
			// 	host.stepCache[col * sign] = [col * sign, -downFirstSolid, false];
			// }
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

		let floorX = 0;
		let gSpeedReal = host.args.gSpeed ?? 0;

		if(host.args.standingOn && host.args.standingOn.args.convey)
		{
			gSpeedReal += host.args.standingOn.args.convey;
		}

		if(host.args.standingOn && host.args.standingOn.args.trackX)
		{
			floorX = host.args.standingOn.args.xSpeed || host.args.standingOn.args.gSpeed;
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

		host.args.jumpedAt = host.args.y;
		host.args.jumping  = true;

		const tileMap = host.viewport.tileMap;

		if(tileMap.getSolid(host.args.x + (host.args.width / 2) * Math.sign(host.args.xSpeed), host.args.y, host.args.layer))
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

		host.args.xSpeed += floorX;
	}

	impulse(host, magnitude, direction, willFall = false)
	{
		if(host.args.dead)
		{
			return;
		}

		host.impulseMag = magnitude;
		host.impulseDir = direction;
		host.impulseFal = willFall;
	}

	scanForward(host, speed, height = 0.5, scanActors = true)
	{
		const dir      = Math.sign(speed);
		const radius   = host.args.width / 2;
		const scanDist = Math.abs(speed);

		const startPoint = host.args.falling
			? [0, -host.args.height * height]
			: host.rotatePoint(0, host.args.height * height);
			// ? [radius * -dir, -host.args.height * height]
			// : host.rotatePoint(radius * -dir, host.args.height * height);

		const angle = host.args.falling
			? [Math.PI,0,0][dir+1]
			: host.realAngle + [0,0,Math.PI][dir+1]

		return host.castRayQuick(
			host.args.falling
				// ? scanDist + host.args.width + 1
				? scanDist + radius + 1
				: scanDist + 1
			, angle
			, startPoint
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

	checkBelow(host, testX = null, testY = null)
	{
		testX = testX ?? host.args.x;
		testY = testY ?? host.args.y;

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
			below = below.filter(x => x.callCollideHandler(host) !== false);
		}

		return below;
	}
}
