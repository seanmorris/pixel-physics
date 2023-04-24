import { Uuid } from 'curvature/base/Uuid';
import { Model } from 'curvature/model/Model';

const buildTag  = document.head.querySelector('meta[name="x-build-time"]');
const buildTime = buildTag ? buildTag.getAttribute('content') : null;

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
	buildTime = buildTime;
	replay    = null;

	consume(skeleton, override = false)
	{
		super.consume(skeleton, override);

		this.uuid = skeleton.uuid || this.uuid || String(new Uuid);
	}
}
