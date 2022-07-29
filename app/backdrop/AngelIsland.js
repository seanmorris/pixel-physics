import { Backdrop } from './Backdrop';

const recolor = [
	  {'990099':'fcfcfc', '770077':'0048fc', '550055':'90fcfc'}
	, {'990099':'90fcfc', '770077':'fcfcfc', '550055':'90fcfc'}
	, {'990099':'6c90fc', '770077':'90fcfc', '550055':'90fcfc'}
	, {'990099':'0048fc', '770077':'6c90fc', '550055':'90fcfc'}
	, {'990099':'fcfcfc', '770077':'0048fc', '550055':'6c90fc'}
	, {'990099':'90fcfc', '770077':'fcfcfc', '550055':'0048fc'}
	, {'990099':'6c90fc', '770077':'90fcfc', '550055':'fcfcfc'}
	, {'990099':'0048fc', '770077':'6c90fc', '550055':'90fcfc'}
];

export class AngelIsland extends Backdrop
{
	constructor(args, parent)
	{
		super(args, parent);

		this.args.name = 'angel-island';

		this.args.strips = [
			{
				autoscroll: -0.080
				, parallax: 0.005
				, url:      '/Sonic/backdrop/angel-island/sky-0.png'
				, height:   196
			}
			, {
				autoscroll: -0.080
				, parallax: 0.005
				, url:      '/Sonic/backdrop/angel-island/reflection.png'
				, height:   33
			}
			, {
				autoscroll: 0.000
				, parallax: 0.009
				, url:      '/Sonic/backdrop/angel-island/water-1.png'
				, interval: 12
				, timeout:  100
				, frame:    0
				, recolor
				, height:   -16
			}
			, {
				autoscroll: 0.000
				, parallax: 0.011
				, url:      '/Sonic/backdrop/angel-island/water-2.png'
				, height:   8
				, interval: 14
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.013
				, url:      '/Sonic/backdrop/angel-island/water-3.png'
				, height:   8
				, interval: 16
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.015
				, url:      '/Sonic/backdrop/angel-island/water-4.png'
				, height:   16
				, interval: 16
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.017
				, url:      '/Sonic/backdrop/angel-island/water-5.png'
				, height:   8
				, interval: 16
				, timeout:  100
				, frame:    4
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.019
				, url:      '/Sonic/backdrop/angel-island/water-6.png'
				, height:   8
				, interval: 13
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.021
				, url:      '/Sonic/backdrop/angel-island/water-7.png'
				, height:   16
				, interval: 11
				, timeout:  100
				, frame:    1
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.023
				, url:      '/Sonic/backdrop/angel-island/water-8.png'
				, height:   8
				, interval: 12
				, timeout:  100
				, frame:    2
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.025
				, url:      '/Sonic/backdrop/angel-island/water-9.png'
				, height:   8
				, interval: 11
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.028
				, url:      '/Sonic/backdrop/angel-island/water-10.png'
				, height:   8
				, interval: 13
				, timeout:  100
				, frame:    3
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.030
				, url:      '/Sonic/backdrop/angel-island/water-11.png'
				, height:   16
				, interval: 13
				, timeout:  100
				, frame:    4
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.033
				, url:      '/Sonic/backdrop/angel-island/water-12.png'
				, height:   8
				, interval: 11
				, timeout:  100
				, frame:    5
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.035
				, url:      '/Sonic/backdrop/angel-island/water-13.png'
				, height:   7
				, interval: 15
				, timeout:  100
				, frame:    0
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.037
				, url:      '/Sonic/backdrop/angel-island/water-14.png'
				, height:   8
				, interval: 17
				, timeout:  100
				, frame:    1
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.039
				, url:      '/Sonic/backdrop/angel-island/water-15.png'
				, height:   8
				, interval: 19
				, timeout:  100
				, frame:    2
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.041
				, url:      '/Sonic/backdrop/angel-island/water-16.png'
				, height:   6
				, interval: 11
				, timeout:  100
				, frame:    3
				, recolor
			}
			, {
				autoscroll: 0.000
				, parallax: 0.044
				, url:      '/Sonic/backdrop/angel-island/water-17.png'
				, height:   10
				, interval: 13
				, timeout:  100
				, frame:    4
				, recolor
			}
		];
	}
}
