import { Uuid } from 'curvature/base/Uuid';
import { Model } from 'curvature/model/Model';

export class Trace extends Model
{
	class     = 'Trace';
	uuid      = String(new Uuid);
	created   = Date.now();
	local     = String(new Date);
	tz        = Intl.DateTimeFormat().resolvedOptions().timeZone;
	stack     = '';
	message   = '';
	timeStamp = null;
	filename  = null;
	lineno    = null;
	colno     = null;
}
