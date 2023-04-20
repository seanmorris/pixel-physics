import { Pool } from 'curvature/base/Pool';
import { Elicit } from 'curvature/net/Elicit';
import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class BgmHandler extends Mixin.with(EventTargetMixin)
{
	volume  = 1.0;
	tracks  = new Map;
	plays   = new Map;
	tags    = new Map;
	stack   = [];
	playing = null;
	id3     = new Map;
	request = [];
	pool    = new Pool({max: 3, init: item => { item.open(); return item }})

	setVolume(volume = 1)
	{
		this.volume = volume;

		if(this.playing)
		{
			this.playing.volume = volume;
		}
	}

	register(tag, url, maxConcurrent = 1)
	{
		const getTags = new Elicit(url, {defer:true});

		getTags.addEventListener('error', event => event.preventDefault());

		this.pool.add(getTags);

		this.request.push(getTags.blob().then(blob => Promise.all([blob.arrayBuffer(), URL.createObjectURL(blob)])).then( ([buffer, objectUrl]) => {

			const list = Array(maxConcurrent).fill().map(x => new Audio(objectUrl));

			this.tracks.set(tag, list);

			const bytes = new Uint8Array(buffer);
			const prefix = String.fromCharCode(...bytes.slice(0, 3));

			if(prefix !== 'ID3')
			{
				return;
			}

			const version  = bytes[3];
			const revision = bytes[4];
			const flags    = bytes[5];
			const size     = bytes[6] << 21 | bytes[7] << 14 | bytes[8] << 7 | bytes[9];

			let i = 10;

			const tags = {};

			while(i < size)
			{
				const framePrefix = String.fromCharCode(...bytes.slice(i, i+4));
				const frameSize   = 10 + (bytes[i+4] << 21 | bytes[i+5] << 14 | bytes[i+6] << 7 | bytes[i+7]);

				if(frameSize === 10)
				{
					break;
				}

				if(i + frameSize > size)
				{
					break;
				}

				const frameValue  = String.fromCharCode(...bytes.slice(i + 11, i + frameSize));

				if(!framePrefix)
				{
					break;
				}

				i += frameSize;

				if(!framePrefix)
				{
					break;
				}

				tags[framePrefix] = frameValue;
			}

			const commentPrefixU = 'XXXComment\u0000';
			const commentPrefixL = 'xxxComment\u0000';

			if(tags['COMM'] && tags['COMM'].substr(0, commentPrefixU.length) === commentPrefixU)
			{
				tags['COMM'] = tags['COMM'].slice( commentPrefixU.length );
			}
			else if(tags['COMM'] && tags['COMM'].substr(0, commentPrefixL.length) === commentPrefixL)
			{
				tags['COMM'] = tags['COMM'].slice( commentPrefixL.length );
			}

			for(const track of list)
			{
				console.log(tags);
				this.id3.set(track, tags);
			}
		}));
	}

	play(tag, {loop = false, interlude = false, dontClear = false} = {})
	{
		if(this.tags.get(this.playing) !== tag && !interlude && !dontClear)
		{
			for(const track of this.stack)
			{
				track.pause();
			}

			this.stack.length = 0;
			this.playing = false;
		}

		if(!this.playing)
		{
			this.playing = this.stack[this.stack.length - 1];
		}

		if(this.playing && this.tags.get(this.playing) === tag)
		{
			if(this.playing.paused)
			{
				const cancelable = true;
				const detail = this.id3.get(this.playing);

				const play = new CustomEvent('play', {detail, cancelable});

				if(!this.dispatchEvent(play))
				{
					return;
				}

				return this.unpause();
			}
		}
		else if(this.playing)
		{
			this.playing.pause();
		}

		if(!this.tracks.has(tag))
		{
			return;
		}

		const candidates = new Map;
		const tracks = this.tracks.get(tag);

		let selected = null;

		for(const track of tracks)
		{
			if(!this.plays.has(track))
			{
				selected = track;
				break;
			}

			candidates.set(this.plays.get(track), track);
		}

		if(!selected)
		{
			const sorted = [...candidates].sort((a,b) => Math.sign(a[0] - b[0]));

			selected = sorted[0][1];
		}

		if(selected && selected !== this.playing)
		{
			selected.playbackRate = 1.0;
			selected.currentTime  = 0.0;
			selected.volume       = this.volume;
			selected.loop         = loop;

			this.plays.set(selected, Date.now());

			this.playing = selected;

			this.stack.push(this.playing);

			const onCompleted = event => {
				this.stack.pop();
				this.playing = this.stack[this.stack.length-1]
				// this.play();
			};

			if(!loop)
			{
				this.playing.addEventListener('ended', onCompleted, {once: true});
			}

			this.tags.set(selected, tag);

			Promise.all(this.request).then(() => {
				const cancelable = true;
				const detail = this.id3.get(selected);
				const play = new CustomEvent('play', {detail, cancelable});

				if(this.dispatchEvent(play))
				{
					try { selected.play() }
					catch(error) { console.warn(error) }
				}
			});
		}
	}

	stop(tag = null)
	{
		if(tag === null && this.playing)
		{
			this.playing.pause();

			this.playing = null;
		}

		for(const t of Object.keys(this.stack))
		{
			const track = this.stack[t];

			if(!this.tags.has(track))
			{
				delete this.stack.splice(t, 1);
				continue;
			}

			if(tag === null || this.tags.get(track) === tag)
			{
				const cancelable = true;
				const detail = this.id3.get(this.playing);

				const stop = new CustomEvent('stop', {detail, cancelable});

				if(this.dispatchEvent(stop))
				{
					if(!track.paused)
					{
						track.pause();
					}

					delete this.stack.splice(t, 1);
				}
			}
		}

		this.playing = this.stack[ this.stack.length - 1 ];

		if(this.playing)
		{
			this.play(this.tags.get(this.playing), {dontClear:true});
		}
	}

	pause()
	{
		if(!this.playing || this.playing.paused)
		{
			return;
		}

		const cancelable = true;
		const detail = this.id3.get(this.playing);

		const pause = new CustomEvent('pause', {detail, cancelable});

		if(!this.dispatchEvent(pause))
		{
			return;
		}

		this.playing.pause();
	}

	unpause()
	{
		if(!this.playing || !this.playing.paused)
		{
			return;
		}

		const cancelable = true;
		const detail = this.id3.get(this.playing);

		const unpause = new CustomEvent('unpause', {detail, cancelable});

		if(!this.dispatchEvent(unpause))
		{
			return;
		}

		this.playing && this.playing.play();
	}

	fadeOut(time)
	{
		return new Promise(accept => {
			let track;
			let start;
			let initial;
			let interval;

			track = this.playing;

			const fade = () => {
				if(!track)
				{
					clearInterval(interval);
					return;
				}

				if(!start)
				{
					initial = track.volume;
					start = Date.now();
				}

				const now = Date.now();
				const vol = 1 - Math.min(1, (now - start) / time);

				track.volume = vol * initial;

				if(!vol)
				{
					this.stop(this.tags.get(track));
					clearInterval(interval);
					accept();
				}
			};

			interval = setInterval(fade, 16);
		});
	}
}

export const Bgm = new BgmHandler;
