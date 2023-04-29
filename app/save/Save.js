import { Uuid } from 'curvature/base/Uuid';
import { Model } from 'curvature/model/Model';
import { SaveDatabase } from './SaveDatabase';

class ProgressState
{
	lastCheckpoint = null;
	lastZone = null;

	zonesComplete = {};
	characters = {};

	constructor()
	{
		// Object.preventExtensions(this);
	}
}

const openDb = SaveDatabase.open('saves', 1);

export class Save extends Model
{
	// emblems    = {};
	// characters = {};

	id       = null;
	created  = Date.now();
	emeralds = [];

	zones = {
		// '/map/empty-zone-2.json': {
		// 	emeralds: ['red']
		// 	, emblems: []
		// 	, lastCheckpoint: null
		// }
		// , '/map/emblem-test.json': {
		// 	emeralds: []
		// 	, emblems: []
		// 	, lastCheckpoint: null
		// }
	};

	static from(skeleton)
	{
		const save = super.from(skeleton);

		save.emeralds  = Object.assign([], save.emeralds);

		for(const zone of Object.values(save.zones))
		{
			zone.emblems  = Object.assign([], zone.emblems);
		}

		return save;
	}

	getZoneState(zone)
	{
		const save = this.zones[zone] || {
			lastCheckpoint: null
			, emblems:  []
			, rings: 0
			, score: 0
			, time:  0
		};

		return this.zones[zone] = save;
	}

	static index()
	{
		return openDb.then(database => {

			const query = {
				direction: 'next'
				, index:   'created'
				, store:   'saves'
			};

			const saves = [];

			return database.select(query)
			.each(save => saves.push(save))
			.then(() => saves);
		});
	}

	save()
	{
		openDb.then(database => {
			if(this.id)
			{
				database.update('saves', this);
			}
			else
			{
				this.id = String(new Uuid);
				database.insert('saves', this);
			}
		});
	}

	load()
	{}
}
