import { View } from 'curvature/base/View';
import { CharacterString } from '../ui/CharacterString';

export class ZoneSuffix extends View
{
	preserve = true;
	template =	`<div class = "zone-suffix">
	<div class = "row">
		<!-- <div class = "checkpoint"></div> -->
		<div class = "rings">[[rings]]</div>
		<div class = "time">[[time]]</div>
		<div class = "air">[[air]]</div>
		<div class = "score">[[score]]</div>
	</div>
	<div class = "row">
		<div class = "emblems" cv-each = "emblems:emblem">
			<img src = "/custom/hud-emblem.png" />
		</div>
	</div>
</div>`;

	font = 'small-menu-font';

	constructor(args, parent)
	{
		super(args, parent);

		parent.loadSaves().then(saves => {

			const state = parent.getZoneState(this.args.map);

			const totalSeconds = Math.floor(state.time / 60);
			const ticks   = String(Math.ceil((state.time % 60) * 1.67)).padEnd(2, '0');
			const seconds = String(state.time ? totalSeconds % 60 : 0).padStart(2, '0');
			const minutes = state.time ? Math.floor(totalSeconds / 60) : 0;

			this.args.emblems = state.emblems.slice(0,5);

			this.args.rings = new CharacterString({
				value:  state.rings || 0
				, font: this.font
			});

			this.args.time = new CharacterString({
				value:  (`${minutes}:${seconds}.${ticks}` || '--')
				, font: this.font
			});

			this.args.air = new CharacterString({
				value:  (Number(state.air || 0) * 100).toFixed(2) + '%'
				, font: this.font
			});

			this.args.score = new CharacterString({
				value:  (state.score || 0)
				, font: this.font
			});

			console.log();
		});
	}
}
