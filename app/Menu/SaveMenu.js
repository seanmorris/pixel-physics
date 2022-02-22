import { SavestateDatabase } from '../savestates/SavestateDatabase';

export const SaveMenu = parent => { return {
	children: {
		Save: {
			callback: () => {


				if(!parent.controlActor)
				{
					return
				}

				const controlActor = parent.controlActor;

				const currentMap = parent.currentMap;
				const character  = controlActor.args.canonical;
				const checkpoint = parent.getCheckpoint(controlActor.args.id);

				const savestate  = {currentMap, character, checkpoint};

				console.log(savestate);

				SavestateDatabase.open('savestates', 1).then(database => {

					const store = 'savestates';

					database
					.insert(store, savestate)
					.then(result => {
						console.log(result);

						const index = 'id';
						const query = {store, index};

						database
						.select(query)
						.each(savestate => console.log(savestate))
						.then(results => console.log(results))
					});
				});
			}
		}
	}
}};
