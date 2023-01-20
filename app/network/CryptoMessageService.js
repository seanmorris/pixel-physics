import { CryptoMessage } from './CryptoMessage';
import { Uuid } from 'curvature/base/Uuid';

export class CryptoMessageService
{
	requests = new Map;

	invite(to)
	{
		const uuid = String(new Uuid);

		const generateKeyPair = window.crypto.subtle.generateKey(
			{name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'}
			, true
			, ['encrypt', 'decrypt']
		)

		generateKeyPair.then((keyPair) => this.requests.set(uuid, {keyPair}));

		return generateKeyPair
		.then((keyPair) => window.crypto.subtle.exportKey('spki', keyPair.publicKey))
		.then(publicKey => ({
			pub: btoa(String.fromCharCode(...new Uint8Array(publicKey)))
			, uuid
			, to
		}));
	}

	accept(message)
	{
		const rawForeignKey = message.content.pub;
		const messageUuid   = message.content.uuid
		const replyToUuid   = message.content.re;
		const sender        = message.sender;
		const uuid          = String(new Uuid);

		const importForeignKey = fetch('data:text/plain;base64,' + rawForeignKey)
		.then(response => response.arrayBuffer())
		.then(foreignKey => {
			return window.crypto.subtle.importKey(
				"spki"
				, foreignKey
				, { name: "RSA-OAEP", hash: "SHA-256"}
				, true
				, ["encrypt"]
			);
		});

		const generateKeyPair = window.crypto.subtle.generateKey(
			{name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'},
			true,
			['encrypt', 'decrypt']
		);

		generateKeyPair.then(keyPair => this.requests.set(uuid, {keyPair}));

		let decryptContent = Promise.resolve();

		if(message.content.key && this.requests.has(replyToUuid))
		{
			const request                = this.requests.get(replyToUuid);
			const rawForeignSymmetricKey = message.content.key;
			const rawForeignIv           = message.content.iv;
			const rawContent             = message.content.packet;

			this.requests.delete(replyToUuid);

			const decryptForeignSymmetricKey = fetch('data:text/plain;base64,' + rawForeignSymmetricKey)
			.then(response => response.arrayBuffer())
			.then(foreignSymmetricKey => {
				return window.crypto.subtle.decrypt(
					{ name: "RSA-OAEP" }
					, request.keyPair.privateKey
					, foreignSymmetricKey
				);
			}).then(buffer => {

				const fullKey = new Uint8Array(buffer);

				const iv  = fullKey.slice(0, 12);
				const key = fullKey.slice(12);

				const importForeignSymmetricKey = window.crypto.subtle.importKey(
					'raw'
					, key
					, { name: "AES-GCM", length: 256}
					, true
					, ["decrypt"]
				);

				return Promise.all([importForeignSymmetricKey, iv]);
			});

			const fetchContent = fetch('data:text/plain;base64,' + rawContent).then(response => response.arrayBuffer());

			decryptContent = Promise.all([decryptForeignSymmetricKey, fetchContent])
			.then(([foreignSymmetricKey, content]) => {
				return window.crypto.subtle.decrypt(
					{ name: "AES-GCM", iv: foreignSymmetricKey[1] }
					, foreignSymmetricKey[0]
					, content
				);
			}).then(contentBuffer => {
				const blob = new Blob([contentBuffer], {type: 'text/plain; charset=utf-8'});
				return blob.text();
			});
		}

		return Promise.all([generateKeyPair, importForeignKey, decryptContent])
		.then(([{publicKey}, foreignKey, content]) => new CryptoMessage({
				uuid
				, foreignKey
				, publicKey
				, content
				, sender
				, re: messageUuid
			})
		);
	}
}
