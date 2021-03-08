self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('static').then((cache) => {
			return cache.addAll(
				[
					'/app.css'
					, '/app.js'
					, '/'
				]
			);
		})
	);
});

const resourceMatch = /\.(js|css|svg|png|dae)$/;
const forceRefresh  = true;

self.addEventListener('fetch', (event) => {

	const eventResponse = caches.open('static').then((cache) => {

		return cache.match(event.request).then((cacehedResponse) => {

			const refreshFetch = fetch(event.request).then((refreshReponse) => {

				const reqUrl = new URL(event.request.url);

				// if(reqUrl.pathname.match(resourceMatch))
				// {
				// 	cache.put(event.request, refreshReponse.clone());
				// }

				return refreshReponse;
			});

			refreshFetch.catch( error => console.error(error) );

			const respUrl = new URL(event.request.url);

			if(forceRefresh || !cacehedResponse)
			{
				event.waitUntil(refreshFetch);

				if(forceRefresh)
				{
					return refreshFetch;
				}
			}

			return cacehedResponse || refreshFetch;

		});
	});

	event.respondWith(eventResponse);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			cacheNames.map((cacheName) => {
	          return caches.delete(cacheName);
	        });
		})
	);
});
