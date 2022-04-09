import { Database } from 'curvature/model/Database';

export class SaveDatabase extends Database
{
	_version_1(database)
	{
		this
		.createObjectStore('saves', {keyPath: 'id'})
		.createIndex('created', 'created', {unique: false});
	}
}
