export class Button
{
	active   = false;

	pressure = 0;
	delta    = 0;
	time     = 0;

	update(options = {})
	{
		if(this.pressure)
		{
			this.time++;
		}
		else if(!this.pressure && this.time > 0)
		{
			this.time = -1;
		}
		else if(!this.pressure && this.time < 0)
		{
			this.time--;
		}

		if(this.time < -1 && this.delta === -1)
		{
			this.delta = 0;
		}
	}

	press(pressure)
	{
		this.delta    = Number(pressure - this.pressure).toFixed(3) - 0;
		this.pressure = Number(pressure).toFixed(3) - 0;
		this.active   = true;
		this.time     = this.time > 0 ? this.time : 0;
	}

	release()
	{
		// if(!this.active)
		// {
		// 	return;
		// }

		this.delta    = Number(-this.pressure).toFixed(3) - 0;
		this.pressure = 0;
		this.active   = false;
	}

	zero()
	{
		this.pressure = this.delta = 0;
		this.active   = false;
	}
}
