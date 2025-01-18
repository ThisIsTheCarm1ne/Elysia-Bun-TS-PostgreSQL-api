const zlib = require('node:zlib');

async function fetchItems() {
    try {
        const response = await fetch('https://api.skinport.com/v1/items', {
            method: 'GET',
            headers: {
                'Accept-Encoding': 'br',
            },
        });
        const brotliDecompress = zlib.createBrotliDecompress();
        // Process the response stream
        const chunks = [];
        await pipelineAsync(
            response.body, // Readable stream from fetch
            brotliDecompress, // Decompress Brotli data
            async function* (source) {
                for await (const chunk of source) {
                    chunks.push(chunk);
                    yield chunk;
                }
            }
        );

        // Combine chunks into a single buffer
        const decompressedData = Buffer.concat(chunks);
        console.log('Decompressed data length:', decompressedData.length);

        // Convert buffer to string and parse JSON
        const jsonString = decompressedData.toString('utf-8');
        const items = JSON.parse(jsonString);
        console.log('Parsed items count:', items.length);

        return items;
        /*
        const compressedData = await response.arrayBuffer();

        const decompressedData = await zlib.brotliDecompressSync(Buffer.from(compressedData));
        //console.log(decompressedData);
        const data = JSON.parse(decompressedData.toString());
        //console.log(data);
        return data;

         */
    } catch (e) {
        return e;
    }
}
fetchItems().then((items) => {
    console.log(items);
});
