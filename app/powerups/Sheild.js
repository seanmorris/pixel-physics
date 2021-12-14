import { Powerup } from './Powerup';

export class Sheild extends Powerup
{
	immune(host, other, type = 'normal')
	{
		if(type === 'fire')
		{
			return true;
		}

		return false;
	}

	// immune(other, type)
	// {
	// 	return false;
	// }
}
