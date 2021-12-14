import { Sheild } from './Sheild';

export class SuperSheild extends Sheild
{
	template = `<div class = "sheild super-sheild">
		<div class = "super-sheild-shine"></div>
		<div class = "super-sheild-spark"></div>
		<div class = "super-sheild-flare"></div>
	</div>`;

	type = 'super';

	immune(host, other, type = 'normal')
	{
		if(host.isSuper || host.isHyper)
		{
			return true;
		}

		return false;
	}
}
