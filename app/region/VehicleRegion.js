import { Region } from "./Region";
import { ObjectPalette } from '../ObjectPalette';


export class VehicleRegion extends Region
{
	SpawnedFor = Symbol('SpawnedFor');

	constructor(...args)
	{
		super(...args);

		this.args.type = 'region vehicle';

	}

	updateActor(other)
	{
		if(other[this.SpawnedFor] === false)
		{
			return;
		}

		if(other[this.SpawnedFor])
		{
			const spawned = other[this.SpawnedFor];

			spawned.args.x = other.args.x;
			spawned.args.y = other.args.y;
			spawned.args.xSpeed = other.args.xSpeed;
			spawned.args.ySpeed = other.args.ySpeed;
			spawned.args.gSpeed = other.args.gSpeed;

			other.args.standingOn = spawned;
		}

		if(!other.controllable)
		{
			return;
		}

		if(other.isVehicle)
		{
			return;
		}

		if(!other.args.standingOn)
		{
			const vehicleType = ObjectPalette[this.args.vehicle];

			if(!vehicleType)
			{
				return;
			}

			const newVehicle = new vehicleType({
				x:other.x
				,y:other.y
				,xSpeed:other.args.xSpeed
				,ySpeed:other.args.ySpeed
				,gSpeed:other.args.gSpeed
				,falling:other.args.falling
				,lockedIn:true
			});

			this.viewport.spawn.add({object:newVehicle});

			other.args.standingOn = newVehicle;

			other[this.SpawnedFor] = newVehicle;
		}
	}

	leave(other)
	{
		if(other.occupant)
		{
			other = other.occupant;
		}

		if(!this.args.restricted)
		{
			return;
		}

		if(!other.args.standingOn)
		{
			return;
		}

		if(!other.args.standingOn.isVehicle)
		{
			return;
		}

		other[this.SpawnedFor] = false;

		const vehicle = other.args.standingOn;

		vehicle.args.lockedIn = false;
		vehicle.dead = true;

		other.args.standingOn = null;

		other.args.x  = vehicle.args.x;
		other.args.y  = vehicle.args.y;
		other.args.gSpeed  = vehicle.args.gSpeed;
		other.args.xSpeed  = vehicle.args.xSpeed;
		other.args.ySpeed  = vehicle.args.ySpeed;
		other.args.falling = vehicle.args.falling;
	}
}
