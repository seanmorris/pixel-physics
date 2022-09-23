import { Router } from 'curvature/base/Router';
import { Task } from 'subspace-console/Task';
import { Chao as ChaoActor } from '../../actor/Chao';

export class Chao extends Task
{
	static viewport = null;

	static helpText = 'List the chao in the current map.';

	init(command = 'list', ...args)
	{
		if(typeof this['command_' + command] === 'function')
		{
			this['command_' + command](...args);
		}
	}

	command_list()
	{
		if(!Chao.viewport)
		{
			return;
		}

		const actors = Chao.viewport.actors;

		for(const actor of actors.items())
		{
			if(!(actor instanceof ChaoActor))
			{
				continue;
			}

			this.print(`${Number(actor.args.id)}) Chao "${actor.args.name}" is at ${actor.x}, ${actor.y}.`);
		}
	}

	command_name(id, name)
	{
		if(!Chao.viewport)
		{
			return;
		}

		const chao = Chao.viewport.actorsById[id];

		if(!(chao instanceof ChaoActor))
		{
			return;
		}

		chao.args.name = name;
	}

	command_color(id, ...pairs)
	{
		if(!Chao.viewport)
		{
			return;
		}

		const chao = Chao.viewport.actorsById[id];

		if(!(chao instanceof ChaoActor))
		{
			return;
		}

		this.recolor(chao, ...pairs)
	}

	recolor(chao, ...pairs)
	{
		while(pairs.length)
		{
			const colorId = pairs.shift();
			const color = pairs.shift();

			chao.customColors[colorId] = color;
		}
	}

	command_store(id)
	{
		if(!Chao.viewport)
		{
			return;
		}

		const chao = Chao.viewport.actorsById[id];

		if(!(chao instanceof ChaoActor))
		{
			return;
		}

		this.print(JSON.stringify(chao.store()));
	}
}
