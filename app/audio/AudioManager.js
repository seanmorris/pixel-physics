import { Elicit } from 'curvature/net/Elicit';
import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class AudioManager extends Mixin.with(EventTargetMixin)
{
	volume  = 1.0;
	theme   = '/Sonic/carnival-night-zone-act-2-beta.mp3';
	overlay = '/audio/leslie-wai/feel-the-sunshine.mp3';
	tracks  = new Map;
	plays   = new Map;
	tags    = new Map;
	factors = new Map;
	stack   = [];
	playing = null;
	id3     = new Map;
	request = [];

	setVolume(volume = 1)
	{
		this.volume = volume;

		if(this.playing)
		{
			this.playing.volume = volume;
		}
	}

	register(tag, url, {maxConcurrent = 1, volume = 1, fudgeFactor = 0, startTime = 0} = {})
	{
		const list = Array(maxConcurrent).fill().map(x => new Audio(url));

		this.tracks.set(tag, list);

		for(const track of list)
		{
			this.factors.set(track, {volume, fudgeFactor, startTime});
		}

		const getTags = new Elicit(url);

		if(url.substr(-3) === 'mp3')
		{
			this.request.push(getTags.buffer().then(buffer => {

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

				for(const track of list)
				{
					this.id3.set(track, tags);
				}
			}));
		}
	}

	play(tag, loop = false)
	{
		if(!this.playing)
		{
			this.playing = this.stack[this.stack.length-1];
		}

		// if(this.playing && this.tags.get(this.playing) === tag)
		// {
		// 	if(this.playing.paused)
		// 	{
		// 		const cancelable = true;
		// 		const detail = this.id3.get(this.playing);

		// 		const play = new CustomEvent('play', {detail, cancelable});

		// 		if(!this.dispatchEvent(play))
		// 		{
		// 			return;
		// 		}

		// 		return this.unpause();
		// 	}
		// }
		// else if(this.playing)
		// {
		// 	this.playing.pause();
		// }

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

			candidates.set(track, this.plays.get(track));
		}

		if(!selected)
		{
			const sorted = [...candidates].sort((a,b) => Math.sign(a[1] - b[1]));

			selected = sorted[0][0];
		}

		if(selected)
		{
			const {volume, fudgeFactor, startTime} = this.factors.get(selected);

			selected.playbackRate = 1.0;
			selected.currentTime  = startTime;
			selected.volume       = Math.max(0, Math.min(1, this.volume * (volume + (fudgeFactor * (Math.random() + -0.5)))));
			selected.loop         = loop;

			this.plays.set(selected, Date.now());

			this.playing = selected;

			this.stack.push(this.playing);

			const onCompleted = event => {
				this.stack.pop();
				this.playing = this.stack[this.stack.length-1]
				this.play();
			};

			if(!loop)
			{
				this.playing.addEventListener('ended', onCompleted, {once: true});
			}

			this.tags.set(selected, tag);

			const cancelable = true;
			const play = new CustomEvent('play', {cancelable});

			if(this.dispatchEvent(play))
			{
				try { selected.play() }
				catch(error) { console.warn(error) }
			}

			Promise.all(this.request).then(() => {
				// const detail = this.id3.get(selected);
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
			this.play(this.tags.get(this.playing));
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

			const fade = () => {
				track = this.playing;

				if(!track)
				{
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