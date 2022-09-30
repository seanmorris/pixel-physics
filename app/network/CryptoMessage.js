import { Uuid } from 'curvature/base/Uuid';
import { CryptoReply } from './CryptoReply';

export class CryptoMessage
{
	uuid;
	re;

	encryptedSymmetricKey;
	symmetricKey;
	iv;

	foreignKey;
	publicKey;
	content;

	sender;

	constructor({uuid, re, encryptedSymmetricKey, symmetricKey, iv, foreignKey, publicKey, content, sender})
	{
		this.uuid = uuid || String(new Uuid);

		Object.assign(this, {uuid, re, encryptedSymmetricKey, symmetricKey, iv, foreignKey, publicKey, content, sender});
	}

	createReply(content)
	{
		if(typeof content === 'object')
		{
			console.warn('Encoding non-string value with JSON.stringify().');
			content = JSON.stringify(content);
		}

		return fetch('data:text/plain,' + content)
		.then(r => r.arrayBuffer())
		.then(contentBuffer => window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: this.iv }
			, this.symmetricKey
			, contentBuffer
		))
		.then(encryptedContent => {
			return new CryptoReply({
				packet:  btoa(String.fromCharCode(...new Uint8Array(encryptedContent)))
				, key:   btoa(String.fromCharCode(...new Uint8Array(this.encryptedSymmetricKey)))
				, pub:   btoa(String.fromCharCode(...new Uint8Array(this.publicKey)))
				, uuid:  this.uuid
				, to:    this.sender
				, re:    this.re
			});
		})
	}
}
