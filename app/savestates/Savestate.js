class ProgressState
{
	lastCheckpoint = null;
	lastZone = null;

	zonesComplete = {};
	characters = {};

	constructor()
	{
		// Object.preventExtensions(this);
	}
}

export class Savestate
{
	emeralds   = {};
	characters = {};

	constructor()
	{
		// Object.preventExtensions(this);
	}
}
