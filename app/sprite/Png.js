const header = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

class Pixel
{
	r = 0;
	g = 0;
	b = 0;
	a = 1;

	constructor(r = 0, g = 0, b = 0, a = 1)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	mean()
	{
		return (this.r+this.g+this.b) / 3;
	}

	hex(length = 3)
	{
		if(length === 3)
		{
			return `${this.r.toString(16).padStart(2,'0')}${this.g.toString(16).padStart(2,'0')}${this.b.toString(16).padStart(2,'0')}`;
		}

		if(length === 4)
		{
			return `${this.r.toString(16).padStart(2,'0')}${this.g.toString(16).padStart(2,'0')}${this.b.toString(16).padStart(2,'0')}${this.a.toString(16).padStart(2,'0')}`;
		}
	}

	valueOf()
	{
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}
}

class Chunk
{
	previous = null;
	content  = null;
	length   = 0;
	start    = 0;
	type     = '';
	crc      = 0;

	get text()
	{
		return this.bytes.map(b => String.fromCharCode(b)).join('');
	}

	get bytes()
	{
		const bytes = [];

		for(let i = 0; i < this.length; i++)
		{
			bytes.push( this.content.getUint8(i) );
		}

		return bytes;
	}
}

export class Png
{
	buffer = null;
	width  = 0;
	height = 0;
	depth  = 0;

	colorType   = 0;
	compression = 0;
	filter      = 0;
	interlace   = 0;

	constructor(source)
	{
		if(typeof source === 'string')
		{
			this.ready = fetch(source)
			.then(response => response.arrayBuffer())
			.then(buffer   => {

				this.buffer = buffer;

				this.checkHeader();
				this.indexChunks();
			});
		}
		else if(typeof source === 'object')
		{
			if(source instanceof Png)
			{
				this.ready = Promise.resolve();

				this.buffer = source.buffer.slice(0);

				this.checkHeader();
				this.indexChunks();
			}
		}
	}

	checkHeader()
	{
		const bytes = new Uint8Array(this.buffer);

		for(const i in header)
		{
			if(header[i] !== bytes[i])
			{
				throw new Error('Png is not valid.');
			}
		}
	}

	readIhdr()
	{
		const ihdr  = this.chunks[0];

		this.width  = ihdr.content.getUint32(0);
		this.height = ihdr.content.getUint32(4);
		this.depth  = ihdr.content.getUint8(8);

		this.colorType   = ihdr.content.getUint8(9);
		this.compression = ihdr.content.getUint8(10);
		this.filter      = ihdr.content.getUint8(11);
		this.interlace   = ihdr.content.getUint8(12);
	}

	get palette()
	{
		const palette = [];

		for(const i in this.chunks)
		{
			const chunk = this.chunks[i];

			if(chunk.type !== 'PLTE')
			{
				continue;
			}

			for(let ii = 0; ii < chunk.bytes.length; ii += 3)
			{
				const color = new Pixel(
					chunk.bytes[ii + 0]
					, chunk.bytes[ii + 1]
					, chunk.bytes[ii + 2]
				);

				palette.push(color);
			}

			return palette
		}
	}

	recolor(colorMap = {})
	{
		const palette    = this.palette;
		const newPalette = [];

		for(const i in palette)
		{
			const color = palette[i];

			const rgba = color.valueOf();
			const mean = color.mean();
			const hex  = color.hex();

			if(colorMap[hex])
			{
				const newColor = colorMap[hex];

				const newR = newColor.substring(0, 2);
				const newG = newColor.substring(2, 4);
				const newB = newColor.substring(4, 6);

				const triplet = [newR, newG, newB].map(x => parseInt(x, 16));

				newPalette.push(...triplet);
			}
			else
			{
				newPalette.push(color.r, color.g, color.b);
			}
		}

		const newPng = new Png(this);

		for(const i in newPng.chunks)
		{
			const chunk = newPng.chunks[i];

			if(chunk.type !== 'PLTE')
			{
				continue;
			}

			const newBytes   = new Uint8Array(newPng.buffer);
			const crcPointer = new DataView(newPng.buffer, chunk.start + chunk.length, 4);

			newBytes.set(newPalette, chunk.start);

			crcPointer.setUint32(0, newPng.runCrc( chunk ));
		}

		return newPng;
	}

	runCrc(chunk)
	{
		if(!Png.crcTable)
		{
			Png.crcTable = new Uint32Array(256);

			for(let n = 0; n < 256; n++)
			{
				let c = n;

				for(let k = 0; k < 8; k++)
				{
					if((c & 1) == 1)
					{
						c = 0xEDB88320 ^ ( c >>> 1 );
					}
					else
					{
						c = c >>> 1
					}
				}

				Png.crcTable[n] = c;
			}
		}

		let crc = 0xFFFFFFFF;

		const bytes = new Uint8Array(this.buffer);

		const chunkBytes = bytes.slice(chunk.start - 4, chunk.start + chunk.length);

		for(const i in chunkBytes)
		{
			const byte = chunkBytes[i];

			crc = Png.crcTable[ (crc ^ byte) & 0xFF ] ^ (crc >>> 8);
		}

		crc = (crc ^ 0xFFFFFFFF) >>> 0;

		return crc;
	}

	indexChunks()
	{
		const chunks = [];

		let pos = 8;

		while(pos < this.buffer.byteLength)
		{
			const lengthView = new DataView(this.buffer, pos, 4);

			pos += 4;

			const typeView   = new DataView(this.buffer, pos, 4);

			pos += 4;

			const chunk = new Chunk;

			chunk.start  = pos;

			chunk.length = lengthView.getUint32();

			for(let i = 0; i < 4; i++)
			{
				const byte = typeView.getUint8(i);
				const char = String.fromCharCode(byte);

				chunk.type += char;
			}

			chunk.content = new DataView(this.buffer, pos, chunk.length);

			pos += chunk.length;

			const crcView = new DataView(this.buffer, pos, 4);

			chunk.crc = crcView.getUint32();

			chunk.previous = chunks[ chunks.length - 1 ];

			chunks.push(chunk);

			pos += 4;
		}

		this.chunks = chunks;
	}

	toBlob()
	{
		return new Blob([new Uint8Array(this.buffer)], {type: 'image/png'});
	}

	toUrl()
	{
		return URL.createObjectURL(this.toBlob());
	}

	toDataUri()
	{
		if(this.getDataUri)
		{
			return this.getDataUri;
		}

		const reader = new FileReader();
		reader.readAsDataURL(this.toBlob());

		this.getDataUri = new Promise(accept => reader.addEventListener(
			'load', event => accept(event.target.result)
		));

		return this.getDataUri;
	}
}

Png.Pixel = Pixel;
Png.Chunk = Chunk;
