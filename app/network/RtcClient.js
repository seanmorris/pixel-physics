import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class RtcClient extends Mixin.with(EventTargetMixin)
{
	constructor(rtcConfig)
	{
		super();

		this.peerClient = new RTCPeerConnection(rtcConfig);

		this.offerToken = new Promise(accept => {
			this.peerClient.addEventListener('icecandidate', event => {
				accept(this.peerClient.localDescription);
			});
		});

		this.peerClient.addEventListener('iceconnectionstatechange', () => {
			let state = this.peerClient.iceConnectionState;

			console.log(`RTC state: ${state}`);
		});

		this.peerClientChannel = this.peerClient.createDataChannel("chat")

		this.peerClientChannel.addEventListener('open', () => {
			this.connected = true;

			const messageEvent = new CustomEvent('open', {detail: event.data });

			messageEvent.originalEvent = event;

			this.dispatchEvent(messageEvent);
		});

		this.peerClientChannel.addEventListener('close', () => {
			const messageEvent = new CustomEvent('close', {detail: event.data });

			messageEvent.originalEvent = event;

			this.dispatchEvent(messageEvent);
		});

		this.peerClientChannel.addEventListener('message', event => {
			const messageEvent = new CustomEvent('message', {detail: event.data });

			messageEvent.originalEvent = event;

			this.dispatchEvent(messageEvent);
		});

		this.peerClient.createOffer().then(offer => {
			this.peerClient.setLocalDescription(offer);
		});
	}

	accept(answer)
	{
		const session = new RTCSessionDescription(answer);

		this.peerClient.setRemoteDescription(session);
	}

	send(input)
	{
		this.peerClientChannel.send(input);
	}

	close()
	{
		this.peerClientChannel.close()
	}
}
