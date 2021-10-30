import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';
import { PromiseMixin } from 'curvature/mixin/PromiseMixin';

export class Elicit extends Mixin.with(EventTargetMixin, PromiseMixin)
{
	constructor(url, options = {})
	{
		super();

		this.fetch = fetch(url, options)
		.then(response => this.handleFetch(response))
	}

	headers()
	{
		return this.fetch
		.then(({response, stream}) => response.headers )
	}

	stream(url, options = {})
	{
		return this.fetch
		.then(({response, stream}) => new Response(stream, { headers: response.headers }))
	}

	objectUrl(url, options = {})
	{
		return this.stream(url, options)
		.then(response => response.blob())
		.then(blob => URL.createObjectURL(blob));
	}

	emitProgressEvent(length, received)
	{
		const done = received / length;

		this.dispatchEvent(new CustomEvent(
			'progress', {detail: {length, received, done}}
		));
	}

	iterateDownload(reader, controller, length)
	{
		this.emitProgressEvent(length, 0);

		let received = 0;

		const iterate = () => {

			reader.read().then(({done, value}) => {
				if(done)
				{
					this[PromiseMixin.Accept]();

					controller.close();
					return;
				}

				controller.enqueue(value);

				received += value.length;

				this.emitProgressEvent(length, received);

				return iterate();
			});

		}

		return iterate();
	}

	handleFetch(response)
	{
		const reader = response.body.getReader();
		const length = response.headers.get('Content-Length');
		const elicit = this;

		const stream = new ReadableStream({
			start(controller)
			{
				elicit.iterateDownload(reader, controller, length);
			}
		});

		return {response, stream};
	}
}
