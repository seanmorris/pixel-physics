export class ReplayService
{
	constructor(viewport)
	{
		this.viewport = viewport;
	}

	startDemo(replay, offset = 0)
	{
		const parent = this.viewport;

		parent.reset();
		parent.replayFrames   = replay.getIndexedFrames();
		parent.replayStart    = parent.replayFrames.get(offset || replay.firstFrame) || {};
		parent.replay         = replay;
		parent.maxReplayFrame = replay.lastFrame;
		parent.replayOffset   = -1 + replay.firstFrame + offset;

		Router.setQuery('demo', replay.uuid);

		parent.loadMap({mapUrl: replay.map}).then(() => {
			parent.args.paused    = true;
			parent.playback();
		});
	}
}
