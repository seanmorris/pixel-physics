import { Database } from 'curvature/model/Database';

export class ReplayDatabase extends Database
{
	_version_1(connection)
	{
		const replayStore = this.createObjectStore('replays', {keyPath: 'id', autoIncrement: true});

		replayStore.createIndex('buildTime', 'buildTime', {unique: false});
		replayStore.createIndex('created',   'created',   {unique: false});
		replayStore.createIndex('uuid',      'uuid',      {unique: true} );
		replayStore.createIndex('id',        'id',        {unique: true} );
	}

	_version_2(connection, instance, event)
	{
		const transaction = event.target.transaction;
		const replayStore  = transaction.objectStore('replays');

		replayStore.createIndex('name', 'name', {unique: false});
		replayStore.createIndex('map',  'map', {unique: false});
	}

	_version_3(connection, instance, event)
	{
		const transaction = event.target.transaction;
		const replayStore  = transaction.objectStore('replays');

		replayStore.createIndex('map-id', ['map', 'id'], {unique: true} );

		console.log('existing index names in store', replayStore.indexNames);
	}
}
