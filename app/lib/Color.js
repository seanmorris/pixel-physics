export class Color extends Uint8Array
{
	get r() { return this[0]; };
	get g() { return this[1]; };
	get b() { return this[2]; };

	get rf() { return this[0] / 0xFF; };
	get gf() { return this[1] / 0xFF; };
	get bf() { return this[2] / 0xFF; };

	constructor(value)
	{
		super(3);

		if(typeof value === 'string')
		{
			if(value[0] === '#')
			{
				value = value.substr(1);
			}

			if(value[0] !== '0' && (value[1] !== 'x' || value[1] !== 'X'))
			{
				value = '0x' + value;
			}

			value = parseInt(value);
		}

		if(typeof value === 'number')
		{
			if(value > 0xFFFFFF)
			{
				value = value % 0xFFFFFF;
			}

			this[0] = ((value >> 16) & 0xFF);
			this[1] = ((value >>  8) & 0xFF);
			this[2] = ((value >>  0) & 0xFF);
		}
		else if(Array.isArray(value) && value.length <= 3)
		{
			this[0] = value[0];
			this[1] = value[1];
			this[2] = value[2];
		}
	}

	rotate(h, s, v)
	{
		const normalized = [this.rf, this.gf, this.bf];
		const cMax = Math.max(...normalized);
		const cMin = Math.min(...normalized);

		const delta = cMax - cMin;

		let hInit = 0;

		if(delta && cMax === this.rf)
		{
			hInit = 60 * (((normalized[1] - normalized[2]) / delta) % 6);
		}
		else if(delta && cMax === this.gf)
		{
			hInit = 60 * (((normalized[2] - normalized[0]) / delta) + 2);
		}
		else if(delta && cMax === this.bf)
		{
			hInit = 60 * (((normalized[0] - normalized[1]) / delta) + 4);
		}

		const sInit = delta === 0 ? 0 : delta / cMax;
		const vInit = cMax;

		let   hOut = (hInit + h) % 360
		const sOut = Math.max(0, Math.min(sInit * s,1));
		const vOut = Math.max(0, Math.min(vInit * v,1));

		if(hOut < 0)
		{
			hOut += 360;
		}

		const c = vOut * sOut;
		const x = c * (1 - Math.abs(((hOut / 60) % 2) -1));
		const m = vOut - c;

		let ri, gi, bi;

		if(0 <= hOut && hOut < 60)
		{
			ri = c + m;
			gi = x + m;
			bi = 0 + m;
		}
		else if(60 <= hOut && hOut < 120)
		{
			ri = x + m;
			gi = c + m;
			bi = 0 + m;
		}
		else if(120 <= hOut && hOut < 180)
		{
			ri = 0 + m;
			gi = c + m;
			bi = x + m;
		}
		else if(180 <= hOut && hOut < 240)
		{
			ri = 0 + m;
			gi = x + m;
			bi = c + m;
		}
		else if(240 <= hOut && hOut < 300)
		{
			ri = x + m;
			gi = 0 + m;
			bi = c + m;
		}
		else if(300 <= hOut && hOut < 360)
		{
			ri = c + m;
			gi = 0 + m;
			bi = x + m;
		}

		const rotated = new this.constructor(
			[ri * 0xFF, gi * 0xFF, bi * 0xFF].map(Math.round)
		);

		return rotated;
	}

	toString()
	{
		return String(
			Math.round(this[0]).toString(16).padStart(2, '0')
			+ Math.round(this[1]).toString(16).padStart(2, '0')
			+ Math.round(this[2]).toString(16).padStart(2, '0')
		);
	}

	toPrimitive()
	{
		return (this[0] << 16)
			+ (this[1] << 8);
			+ (this[2] << 0);
	}
}
