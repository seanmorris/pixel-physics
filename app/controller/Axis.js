export class Axis
{
	magnitude = 0;
	delta     = 0;

	constructor({deadZone = 0, proportional = true})
	{
		if(deadZone)
		{
			this.proportional = proportional;
			this.deadZone     = deadZone;
		}
	}

	tilt(magnitude)
	{
		if(this.deadZone && Math.abs(magnitude) >= this.deadZone)
		{
			magnitude = (Math.abs(magnitude) - this.deadZone) / (1 - this.deadZone) * Math.sign(magnitude);
		}
		else
		{
			magnitude = 0;
		}

		this.delta     = Number(magnitude - this.magnitude).toFixed(3) - 0;
		this.magnitude = Number(magnitude).toFixed(3) - 0;
	}

	zero()
	{
		this.magnitude = this.delta = 0;
	}
}
