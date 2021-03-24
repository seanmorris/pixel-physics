import { Mixin } from 'curvature/base/Mixin';
import { EventTargetMixin } from 'curvature/mixin/EventTargetMixin';

export class RtcServer extends Mixin.with(EventTargetMixin)
{
	constructor(rtcConfig)
	{
		super();

		this.peerServer = new RTCPeerConnection(rtcConfig);

		this.answerToken = new Promise(accept => {
			this.peerServer.addEventListener('icecandidate', event => {
				if(!event.candidate)
				{
					return;
				}

				accept(this.peerServer.localDescription);
			});
		})

		this.peerServer.addEventListener('iceconnectionstatechange', () => {
			let state = this.peerServer.iceConnectionState;

			console.log(`RTC state: ${state}`);
		});

		this.peerServer.addEventListener('datachannel', event => {

			this.peerServerChannel = event.channel;

			this.peerServerChannel.addEventListener('open', () => {
				this.connected = true;

				const openEvent = new CustomEvent('open', {detail: event.data });

				openEvent.originalEvent = event;

				this.dispatchEvent(openEvent);

			});

			this.peerServerChannel.addEventListener('close', () => {
				const closeEvent = new CustomEvent('close', {detail: event.data });

				closeEvent.originalEvent = event;

				this.dispatchEvent(closeEvent);
			});

			this.peerServerChannel.addEventListener('message', event => {
				const messageEvent = new CustomEvent('message', {detail: event.data });

				messageEvent.originalEvent = event;

				this.dispatchEvent(messageEvent);
			});

		});
	}

	send(input)
	{
		this.peerServerChannel.send(input);
	}

	close()
	{
		this.peerServerChannel.close()
	}

	answer(offer)
	{
		this.peerServer.setRemoteDescription(offer);

		this.peerServer.createAnswer(
			answer => this.peerServer.setLocalDescription(answer)
			, error => console.error(error)
		);
	}
}
