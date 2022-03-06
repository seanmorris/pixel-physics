export class Countdown
{
	time = 0;
	callback = () => console.warn('No callback set!');

	constructor(time, callback)
	{
		this.time = time;
		this.callback = callback;
	}

	extend(time)
	{
		this.time += time;
	}

	extendTo(time)
	{
		this.time = Math.max(time, this.time);
	}

	update()
	{
		if(this.time > 0)
		{
			this.time--;
		}

		if(this.time <= 0)
		{
			this.callback();
			this.time = 0;
		}
	}
}
