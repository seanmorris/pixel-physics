import { Database } from 'curvature/model/Database';

export class SavestateDatabase extends Database
{
	_version_1(database)
	{
		this
		.createObjectStore('savestates', {keyPath: 'id', autoIncrement: true})
		.createIndex('id', 'id', {unique: true});
	}
}
