import { View } from 'curvature/base/View';

export class LobbyMessage extends View
{
	template = '<span cv-bind = "user.username" title = "[[user.id]]" class = "username"></span>:&nbsp;<span class = "message" cv-bind = "message"></span>';
	preserve = true;
}
