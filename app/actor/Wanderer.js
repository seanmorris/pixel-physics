import { PointActor } from './PointActor';

export class Wanderer extends PointActor
{
	get controllable() { return true; }
}
