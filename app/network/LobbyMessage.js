import { View } from 'curvature/base/View';

export class LobbyMessage extends View
{
	template = `<span title = "[[user.id]] [[time]]" class = "username">&lt;<b>[[user.username]]</b>&gt;</span>:&nbsp;<span class = "message" cv-bind = "message"></span>`;
	preserve = true;
}
