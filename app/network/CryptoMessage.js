import { Uuid } from 'curvature/base/Uuid';
import { CryptoReply } from './CryptoReply';

export class CryptoMessage
{
	content;
	sender;
	uuid;
	re;

	encryptedSymmetricKey;
	foreignKey;
	publicKey;

	constructor({content, sender, uuid, re, foreignKey, publicKey})
	{
		this.uuid = uuid || String(new Uuid);

		Object.assign(this, {content, sender, re, foreignKey, publicKey});
	}

	createReply(content)
	{
		const getSymmetricKey = window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
		const exportSymmetricKey = getSymmetricKey.then(symmetricKey => window.crypto.subtle.exportKey('raw', symmetricKey));

		const iv = window.crypto.getRandomValues(new Uint8Array(12));

		const encryptSymmetricKey = exportSymmetricKey.then(rawSymmetricKey => {

			const fullKey = new Uint8Array([...iv, ...new Uint8Array(rawSymmetricKey)]);

			return window.crypto.subtle.encrypt(
				{ name: 'RSA-OAEP' }
				, this.foreignKey
				, fullKey
			);
		});

		if(typeof content === 'object')
		{
			console.warn('Encoding non-string value with JSON.stringify().');
			content = JSON.stringify(content);
		}

		const getContent = fetch('data:text/plain,' + content).then(r => r.arrayBuffer());

		const encryptContent = Promise.all([getSymmetricKey, getContent])
		.then(([symmetricKey, contentBuffer]) => window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv }
			, symmetricKey
			, contentBuffer
		));

		const exportPublicKey = window.crypto.subtle.exportKey('spki', this.publicKey);

		return Promise.all([encryptContent, encryptSymmetricKey, exportPublicKey])
		.then(([encryptedContent, encryptedSymmetricKey, publicKey]) => {
			return new CryptoReply({
				packet:  btoa(String.fromCharCode(...new Uint8Array(encryptedContent)))
				, key:   btoa(String.fromCharCode(...new Uint8Array(encryptedSymmetricKey)))
				, pub:   btoa(String.fromCharCode(...new Uint8Array(publicKey)))
				, uuid:  this.uuid
				, to:    this.sender
				, re:    this.re
			});
		});
	}
}
