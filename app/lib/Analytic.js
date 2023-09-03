export class Analytic
{
	static report(event = {})
	{
		if(!typeof ga === 'function')
		{
			return;
		}

		requestIdleCallback(() => ga('send', 'event', event));
	}
}
