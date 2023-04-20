import { Database } from 'curvature/model/Database';

export class TraceDatabase extends Database
{
	_version_1(database)
	{
		const errorStore = this.createObjectStore('traces', {keyPath: 'id', autoIncrement: true});

		errorStore.createIndex('position', ['filename', 'lineno', 'colno'], {unique: false} );

		errorStore.createIndex('filename', 'uuid',    {unique: false} );
		errorStore.createIndex('lineno',   'lineno',  {unique: false} );
		errorStore.createIndex('colno',    'colno',   {unique: false} );

		errorStore.createIndex('created',  'created', {unique: false});
		errorStore.createIndex('uuid',     'uuid',    {unique: true} );
		errorStore.createIndex('id',       'id',      {unique: true} );
	}
}
