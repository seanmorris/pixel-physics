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

self.addEventListener('fetch', function(event) {
	const eventResponse = caches.open('static').then((cache) => {

		return cache.match(event.request).then((response) => {

			const respUrl = new URL(event.request.url);

			if(response && respUrl.pathname.match(resourceMatch))
			{
				event.waitUntil(fetch(event.request).then((response) => {

					cache.put(event.request, response.clone());

				}).catch(e=>console.error(e)));
			}

			return response || fetch(event.request).then((response) => {

				const reqUrl = new URL(event.request.url);

				if(reqUrl.pathname.match(resourceMatch))
				{
					cache.put(event.request, response.clone());
				}

				return response;
			}).catch(e=>console.error(e));

		});

	});

	event.respondWith(eventResponse);
});
