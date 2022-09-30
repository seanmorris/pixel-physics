import { View } from 'curvature/base/View';
import { Uuid } from 'curvature/base/Uuid';
import { Bag } from 'curvature/base/Bag';
import { LobbyMessage } from './LobbyMessage';
import { LobbyStatus } from './LobbyStatus';
import { CryptoMessageService } from './CryptoMessageService';

export class Lobby extends View
{
	template       = require('./lobby.html');
	messageService = new CryptoMessageService;
	floodControl   = new Map;
	requests       = new Map;
	users          = new Map;

	serverCandidates = new Set;
	clientCandidates = new Set;

	isClient = null;

	input(){}

	constructor(args,parent)
	{
		super(args, parent);

		this.refreshRtc();

		this.args.roomId   = '!hJzXrccruagKGXTFUQ:matrix.org';
		this.args.invites  = new Bag;
		this.args.users    = new Bag;

		this.args.messages = [];
		parent.matrixConnect().then(matrix => {
			this.matrix = matrix;

			matrix.whoAmI().then(userId => {
				this.user = userId
				this.args.username = userId.user_id;
			});

			const controller = matrix.listenForRoomEvents(this.args.roomId);

			this.onRemove(() => controller.cancelled = true);

			matrix.joinRoom(this.args.roomId);

			this.listen(matrix, 'matrix-event', event => console.log(event.detail.type, event));
			this.listen(matrix, 'sonic-3000.lobby.message', event => this.handleLobbyMessage(event));

			this.listen(matrix, 'sonic-3000.lobby.crypto-game-invite', event => this.handleCryptoGameInvite(event));
			this.listen(matrix, 'sonic-3000.lobby.crypto-game-offer',  event => this.handleCryptoGameOffer(event));
			this.listen(matrix, 'sonic-3000.lobby.crypto-game-accept', event => this.handleCryptoGameAccept(event));
			this.listen(matrix, 'sonic-3000.lobby.crypto-game-reject', event => this.handleCryptoGameReject(event));

			this.listen(matrix, 'sonic-3000.lobby.crypto-candidate-invite',  event => this.handleCryptoCandidateInvite(event));
			this.listen(matrix, 'sonic-3000.lobby.crypto-candidate-present', event => this.handleCryptoCandidatePresent(event));
			this.listen(matrix, 'sonic-3000.lobby.crypto-candidate-ack',     event => this.handleCryptoCandidateAck(event));

			this.listen(matrix, 'matrix-event', event => {
				if(!event.detail.sender)
				{
					return;
				}

				const sender = event.detail.sender;
				const [username,host] = sender.slice(1).split(':');

				if(!this.users.has(event.detail.sender))
				{
					const user = {
						id: sender
						, lastSeen: 0
						, username
						, host
					};

					this.users.set(sender, user);

					this.args.users.add(user);
				}

				const user = this.users.get(sender);

				user.lastSeen = Date.now();
			});

			matrix.syncRoomHistory(
				this.args.roomId
				, message => {
					if(!message.sender)
					{
						return;
					}

					const sender = message.sender;
					const [username,host] = sender.slice(1).split(':');

					if(!this.users.has(sender))
					{
						const user = {
							id: sender
							, lastSeen: 0
							, username
							, host
						};

						this.users.set(sender, user);

						this.args.users.add(user);
					}

					const user = this.users.get(sender);

					user.lastSeen = Date.now();

					if(message.type !== 'sonic-3000.lobby.message')
					{
						return;
					}

					this.args.messages.unshift(new LobbyMessage({
						message: message.content.body
						, user
					}));

					this.onNextFrame(() => {
						this.tags.scroller.scrollTop = this.tags.scroller.scrollHeight;
					});
				}
				, Date.now() - (7 * 24 * 60 * 60 * 1000)
				// , Date.now() - (60 * 1000)
			);
		});

		this.args.input = '';
	}

	sendMessage(event)
	{
		this.matrix.putEvent(
			this.args.roomId
			, 'sonic-3000.lobby.message'
			, {msgtype: 'm.text', body: this.args.input}
		)
		.then(response => this.args.input = '')
		.catch(error => console.error(error))
		.finally(() => this.tags.input.focus());
	}

	logOut(event)
	{
		this.matrix.logOut();
		this.remove();
	}

	keyup(event)
	{
		if(event.key !== 'Enter')
		{
			return;
		}

		this.sendMessage(event);
	}

	sendCryptoGameInvite(event, {id:to})
	{
		this.refreshRtc();

		this.messageService.invite(to).then(invitation => this.matrix.putEvent(
			this.args.roomId
			, 'sonic-3000.lobby.crypto-game-invite'
			, invitation
		))
		.then(response => {
			this.args.messages.push(new LobbyStatus({
				message: `You invited ${to} to play!`
			}));
		})
		.catch(error => console.error(error))
		.finally(() => this.tags.input.focus());
	}

	handleCryptoGameInvite(event)
	{
		if(!this.user || event.detail.content.to !== this.user.user_id)
		{
			return;
		}

		if(!this.floodControl.has(event.detail.sender))
		{
			this.floodControl.set(event.detail.sender, {});
		}

		const floodControl = this.floodControl.get(event.detail.sender);

		if(floodControl.invite && Date.now() - floodControl.invite < 15000)
		{
			this.rejectCryptoGameInvite(event, event.detail, 'flood_control');
			return;
		}

		this.args.messages.push(new LobbyStatus({
			message: `${event.detail.sender} invited you to play!`
		}));

		this.args.invites.add(event.detail);

		floodControl.invite = Date.now();
	}

	acceptCryptoGameInvite(event, invite)
	{
		this.args.invites.delete(invite);

		const replyToUuid = invite.content.uuid;
		const replyToUser = invite.sender;

		this.args.messages.push(new LobbyStatus({message: `You accepted the invite from ${invite.sender}!`}))

		this.isClient = true;

		this.messageService.accept(invite).then(cryptoMessage => {
			Promise.all([this.client.getIceCandidates(), this.client.offer()])
			.then(([candidates, token]) => cryptoMessage.createReply(JSON.stringify({candidates,token})))
			.then(reply => this.matrix.putEvent(this.args.roomId, 'sonic-3000.lobby.crypto-game-offer', reply));
		});

		this.onTimeout(200, ()=> this.args.showInvites = 'hide-invites');
		this.args.showInvites = 'hiding-invites';
	}

	rejectCryptoGameInvite(event, invite, reason = '')
	{
		this.args.invites.delete(invite);

		const replyToUuid = invite.content.uuid;
		const replyToUser = invite.sender;

		this.args.messages.push(new LobbyStatus({message: `You rejected the invite from ${invite.sender}.`}))

		this.messageService.accept(invite).then(cryptoMessage => {
			cryptoMessage.createReply(reason)
			.then(reply => this.matrix.putEvent(this.args.roomId, 'sonic-3000.lobby.crypto-game-reject', reply));
		});

		this.onTimeout(200, ()=> this.args.showInvites = 'hide-invites');
		this.args.showInvites = 'hiding-invites';
	}

	handleCryptoGameOffer(event)
	{
		if(!this.user || event.detail.content.to !== this.user.user_id)
		{
			return;
		}

		const message     = event.detail;
		const replyToUuid = message.content.uuid;
		const replyToUser = message.sender;

		this.messageService.accept(message).then(cryptoMessage => {

			this.args.messages.push(new LobbyStatus({message: `Initializing RTC handshake...`}))

			let {content: offerString} = cryptoMessage;

			const isEncoded = /^s3ktp:\/\/request\/(.+)/.exec(offerString);

			if(isEncoded)
			{
				offerString = atob(isEncoded[1]);
			}

			const {token: offer, candidates: remoteCandidates}  = JSON.parse(offerString);

			Promise.all([this.server.getIceCandidates(), this.server.answer(offer)])
			.then(([candidates, offer]) => {
				cryptoMessage.createReply(JSON.stringify({candidates, token:offer}))
				.then(reply => this.matrix.putEvent(this.args.roomId, 'sonic-3000.lobby.crypto-game-accept', reply))
				.then(() => Promise.all(remoteCandidates.map(c => this.server.addIceCandidate(c))));
			})

			this.args.messages.push(new LobbyStatus({message: `${message.sender} accepted your invite!`}));
		});
	}

	handleCryptoGameAccept(event)
	{
		if(!this.user || event.detail.content.to !== this.user.user_id)
		{
			return;
		}

		const message     = event.detail;
		const replyToUuid = message.content.uuid;
		const replyToUser = message.sender;

		this.messageService.accept(message)
		.then(cryptoMessage => {
			const {token, candidates} = JSON.parse(cryptoMessage.content);
			this.client.accept(token);
			candidates.map(c => this.server.addIceCandidate(c));
		});

		// this.args.messages.push(new LobbyStatus({message: `Completing RTC handshake...`}));
	}

	handleCryptoGameReject(event)
	{
		if(!this.user || event.detail.content.to !== this.user.user_id)
		{
			return;
		}

		const message     = event.detail;
		const replyToUuid = message.content.uuid;
		const replyToUser = message.sender;

		this.messageService.accept(message).then(cryptoMessage => {
			let message = `${event.detail.sender} rejected your invite.`;

			if(cryptoMessage.content)
			{
				message = `${event.detail.sender} rejected your invite: (${cryptoMessage.content})`;
			}

			this.args.messages.push(new LobbyStatus({message}));
		});
	}

	handleCryptoGameCandidateSyn()
	{

	}

	handleCryptoGameCandidateAck()
	{

	}

	handleLobbyMessage({detail:message})
	{
		if(message.room_id !== this.args.roomId)
		{
			return;
		}

		const user = this.users.get(message.sender);

		this.args.messages.push(new LobbyMessage({
			message: message.content.body
			, user
		}));

		this.onNextFrame(() => {
			this.tags.scroller.scrollTop = this.tags.scroller.scrollHeight;
		});
	}

	refreshRtc()
	{
		this.server = this.parent.getServer(true);
		this.client = this.parent.getClient(true);

		const server = this.server;
		const client = this.client;

		const onOpen  = event => this.parent.loadMap({mapUrl: '/map/manic-harbor-zone.json', networked: true});

		const onClose = event => this.disconnect();

		server.addEventListener('open', onOpen, {once:true});
		client.addEventListener('open', onOpen, {once:true});

		server.addEventListener('close', onClose, {once:true});
		client.addEventListener('close', onClose, {once:true});

		// server.addEventListener('icecandidate', event => console.log(event.originalEvent.candidate));
		// client.addEventListener('icecandidate', event => console.log(event.originalEvent.candidate));
	}

	toggleMenu()
	{
		if(!this.args.showMenu || this.args.showMenu == 'hide-menu')
		{
			this.onTimeout(200, ()=> this.args.showMenu = 'show-menu');
			this.args.showMenu = 'showing-menu';
		}
		else
		{
			this.onTimeout(200, ()=> this.args.showMenu = 'hide-menu');
			this.args.showMenu = 'hiding-menu';
		}
	}

	toggleInvites()
	{
		if(!this.args.showInvites || this.args.showInvites == 'hide-invites')
		{
			this.onTimeout(200, ()=> this.args.showInvites = 'show-invites');
			this.args.showInvites = 'showing-invites';
		}
		else
		{
			this.onTimeout(200, ()=> this.args.showInvites = 'hide-invites');
			this.args.showInvites = 'hiding-invites';
		}
	}

	disconnect()
	{
		this.server.close();
		this.client.close();

		this.refreshRtc();

		this.parent.quit(2);

		this.parent.args.networked = false;
		this.parent.args.chatBox = null;
	}
}
