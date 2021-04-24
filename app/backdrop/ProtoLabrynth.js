import { Backdrop } from './Backdrop';

export class ProtoLabrynth extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'proto-labrynth';

		this.args.strips = [
			{
				autoscroll: 0
				, parallax: 0.15
				, url:      '/Sonic/backdrop/protolabrynth/0.png'
				, height:   48
			}
			, {
				autoscroll: 0
				, parallax: 0.125
				, url:      '/Sonic/backdrop/protolabrynth/1.png'
				, height:   24
			}
			, {
				autoscroll: 0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/protolabrynth/2.png'
				, height:   8
			}
			, {
				autoscroll: 0
				, parallax: 0.075
				, url:      '/Sonic/backdrop/protolabrynth/3.png'
				, height:   68
			}
			, {
				autoscroll: 0
				, parallax: 0.1
				, url:      '/Sonic/backdrop/protolabrynth/4.png'
				, height:   18
			}
			, {
				autoscroll: 0
				, parallax: 0.125
				, url:      '/Sonic/backdrop/protolabrynth/5.png'
				, height:   27
			}
			, {
				autoscroll: 0
				, parallax: 0.15
				, url:      '/Sonic/backdrop/protolabrynth/5.png'
				, height:   27
			}
			, {
				autoscroll: 0
				, parallax: 0.175
				, url:      '/Sonic/backdrop/protolabrynth/6.png'
				, height:   76
			}
		];
	}
}
