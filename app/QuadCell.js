const CellRef = Symbol('CellRef');

export class QuadCell
{
	position = {};
	size = {};

	divided = false;
	parent = null;

	leafPoint = {x:null, y:null};
	leafRefs  = null;

	ld = null;
	rd = null;
	lu = null;
	ru = null;

	cells = [];

	constructor(position = {x:0,y:0}, size = {x:0,y:0}, parent = null)
	{
		this.parent = parent;

		this.position.x = position.x;
		this.position.y = position.y;

		this.size.x = size.x;
		this.size.y = size.y;

		Object.seal(this);
	}

	empty(depth = 0)
	{
		if(!this.divided)
		{
			if(!this.leafRefs)
			{
				return true;
			}

			return !this.leafRefs.size;
		}

		for(const c in this.cells)
		{
			if(!this.cells[c].empty(depth + 1))
			{
				return false;
			}
		}

		return true;
	}

	insert(object, point = {x:0, y:0})
	{
		if(!this.contains(point))
		{
			return false;
		}

		if(!this.leafRefs && !this.divided)
		{
			this.leafRefs = new Set;

			this.leafPoint.x = point.x;
			this.leafPoint.y = point.y;

			this.leafRefs.add(object);

			object[CellRef] = this;

			return true;
		}
		else if(
			this.leafRefs
			&& point.x === this.leafPoint.x
			&& point.y === this.leafPoint.y
		){
			this.leafRefs.add(object);

			object[CellRef] = this;
		}
		else if(!this.divided)
		{
			this.divide();
		}

		for(const cell of this.cells)
		{
			if(cell.insert(object, point))
			{
				return true;
			}
		}

		return false;
	}

	move(object, point)
	{
		const cell = object[CellRef];

		if(cell)
		{
			if(cell.leafPoint.x === point.x
				&& cell.leafPoint.y === point.y
			){
				return;
			}

			object[CellRef] = null;

			cell.leafRefs.delete(object);

			if(cell.parent)
			{
				cell.parent.join();
			}
		}

		this.insert(object, point);
	}

	remove(object)
	{
		const cell = object[CellRef];

		if(!cell)
		{
			return;
		}

		object[CellRef] = null;

		cell.leafRefs.delete(object);

		if(cell.parent)
		{
			cell.parent.join();
		}
	}

	join()
	{
		if(!this.empty())
		{
			return false;
		}

		let nonEmpty = null;

		for(const cell of this.cells)
		{
			if(!cell.empty())
			{
				if(nonEmpty)
				{
					return false;
				}

				nonEmpty = cell;
			}
		}

		this.ld = null;
		this.rd = null;
		this.lu = null;
		this.ru = null;

		this.cells = [];

		this.divided = false;

		if(nonEmpty)
		{
			nonEmpty.leafRefs.forEach(l => this.insert(l));
		}

		if(this.parent)
		{
			this.parent.join();
		}
	}

	divide()
	{
		if(this.divided)
		{
			return false;
		}

		const p = this.position;
		const s = this.size;

		this.ld = new this.constructor({x:p.x - s.x/4, y:p.y - s.y/4}, {x:s.x/2, y:s.y/2}, this);
		this.rd = new this.constructor({x:p.x + s.x/4, y:p.y - s.y/4}, {x:s.x/2, y:s.y/2}, this);
		this.lu = new this.constructor({x:p.x - s.x/4, y:p.y + s.y/4}, {x:s.x/2, y:s.y/2}, this);
		this.ru = new this.constructor({x:p.x + s.x/4, y:p.y + s.y/4}, {x:s.x/2, y:s.y/2}, this);

        this.cells.push(
        	this.ld, this.rd
        	, this.lu, this.ru
        );

        this.divided = true;

        if(!this.leafRefs.size)
		{
			return true;
		}

		refs: for(const ref of this.leafRefs)
		{
			cells: for(const cell of this.cells)
			{
				const inserted = cell.insert(ref, this.leafPoint);

				if(inserted)
				{
					this.leafRefs.delete(ref);

					continue refs;
				}
			}
		}
	}

	contains(point = {x: 0, y: 0})
	{
		const xMin = this.position.x - this.size.x / 2;
		const xMax = this.position.x + this.size.x / 2;

		if(point.x < xMin || point.x > xMax)
		{
			return false;
		}

		const yMin = this.position.y - this.size.y / 2;
		const yMax = this.position.y + this.size.y / 2;

		if(point.y < yMin || point.y > yMax)
		{
			return false;
		}

		return true;
	}

	select(xPos, yPos, xSize, ySize, depth = 0)
	{
		if(this.empty())
		{
			return [];
		}

		const xMax = xSize / 2 + this.size.x / 2;

		if(xMax < Math.abs(xPos - this.position.x))
		{
			return [];
		}

		const yMax = ySize / 2 + this.size.y / 2;

		if(yMax < Math.abs(yPos - this.position.y))
		{
			return [];
		}

		if(this.divided)
		{
			const results = new Set;

			for(const cell of this.cells)
			{
				for(const result of cell.select(xPos, yPos, xSize, ySize, depth + 1))
				{
					results.add(result);
				}
			}

			return results;
		}

		return this.leafRefs ? this.leafRefs : [];
	}
}
