import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class RtcServer extends Mixin.with(EventTargetMixin)
{
	candidateTimeout = 500;

	constructor(rtcConfig)
	{
		super();

		this.peerServer = new RTCPeerConnection(rtcConfig);

		this.peerServer.addEventListener('datachannel', event => {

			this.peerServerChannel = event.channel;

			this.peerServerChannel.addEventListener('open', event => {
				const openEvent = new CustomEvent('open', {detail: event.data });
				openEvent.originalEvent = event;
				this.dispatchEvent(openEvent);
				this.connected = true;
			});

			this.peerServerChannel.addEventListener('close', event => {
				const closeEvent = new CustomEvent('close', {detail: event.data });
				closeEvent.originalEvent = event;
				this.dispatchEvent(closeEvent);
				this.connected = false;
			});

			this.peerServerChannel.addEventListener('message', event => {
				const messageEvent = new CustomEvent('message', {detail: event.data });
				messageEvent.originalEvent = event;
				this.dispatchEvent(messageEvent);
			});

			this.peerServerChannel.addEventListener('icecandidate', event => {
				const messageEvent = new CustomEvent('icecandidate', {detail: event.data });
				messageEvent.originalEvent = event;
				this.dispatchEvent(messageEvent);
			});
		});
	}

	send(input)
	{
		this.peerServerChannel && this.peerServerChannel.send(input);
	}

	close()
	{
		this.peerServerChannel && this.peerServerChannel.close()
	}

	getIceCandidates()
	{
		const candidates = new Set;

		return new Promise(accept => this.peerServer.addEventListener('icecandidate', event => {
			candidates.add(event.candidate);

			if(!event.candidate)
			{
				accept([...candidates]);
				return;
			}
		}));
	}

	addIceCandidate(candidate)
	{
		this.peerServer.addIceCandidate(candidate);
	}

	answer(offer)
	{
		return this.peerServer.setRemoteDescription(offer)
		.then(() => this.peerServer.createAnswer())
		.then(answer => this.peerServer.setLocalDescription(answer))
		.then(() => this.peerServer.localDescription);
	}

	fullAnswer({offer, candidates})
	{
		return this.answer(offer).then(answer => {
			return Promise.all(candidates.map(c => this.addIceCandidate(c)))
			.then(() => {
				return this.getIceCandidates().then(candidates => {
					return {answer, candidates};
				})
			})
		});


	}
}
