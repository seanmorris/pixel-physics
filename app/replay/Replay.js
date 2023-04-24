import { Uuid } from 'curvature/base/Uuid';
import { Model } from 'curvature/model/Model';

const buildTag  = document.head.querySelector('meta[name="x-build-time"]');
const buildTime = buildTag ? buildTag.getAttribute('content') : null;

export class Replay extends Model
{
	class      = 'Replay';
	uuid       = String(new Uuid);
	created    = Date.now();
	local      = String(new Date);
	tz         = Intl.DateTimeFormat().resolvedOptions().timeZone;
	buildTime  = buildTime;
	map        = '';
	frames     = [];
	keyFrames  = [];
	name       = '';
	lastFrame  = 0;
	firstFrame = 0;

	consume(skeleton, override = false)
	{
		const _skeleton = Object.assign(Object.create(null), skeleton);

		_skeleton.keyFrames = Object.assign([], _skeleton.keyFrames);
		_skeleton.frames    = Object.assign([], _skeleton.frames);
		_skeleton.frames    = _skeleton.frames.map(f => Object.assign([], f));
		_skeleton.uuid      = _skeleton.uuid || this.uuid || String(new Uuid);

		super.consume(_skeleton, override = false);

		if(_skeleton.frames)
		{
			this.keyFrames  = _skeleton.frames.filter(f => Object.keys(f[2]).length).map(f => f[0]);
			const frameIds  = this.frames.map(f => f[0]);
			this.firstFrame = frameIds.length ? Math.min(...frameIds) : 0;
			this.lastFrame  = frameIds.length ? Math.max(...frameIds) : 0;
		}
	}

	getIndexedFrames()
	{
		const indexed = new Map;

		for(const frame of this.frames)
		{
			indexed.set(frame[0], frame);
		}

		return indexed;
	}
}
