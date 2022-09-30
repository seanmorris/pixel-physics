export class CryptoReply
{
	packet;
	label;
	uuid;
	key;
	pub;
	re;
	to;

	constructor({packet, label, uuid, key, pub, re, to})
	{
		Object.assign(this, {packet, label, uuid, key, pub, re, to});
	}
}
