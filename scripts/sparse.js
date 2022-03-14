const Sparser = require('./Sparser');

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputJSON = inputChunks.join(''),
		mapData    = JSON.parse(inputJSON);

	for(const layer of mapData.layers)
	{
		if(layer.type !== 'tilelayer' || !layer.data)
		{
			continue;
		}

    	const sparsed = [];

    	for(const tileId in layer.data)
    	{
    		const tileNumber = layer.data[tileId];

    		if(!tileNumber)
    		{
    			continue;
    		}

    		sparsed.push(tileId, tileNumber);

    	}

    	layer.sparsed = sparsed;
    	delete layer.data;
	}

    stdout.write(JSON.stringify(mapData));
    stdout.write('\n');
});
