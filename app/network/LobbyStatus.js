import { View } from 'curvature/base/View';

export class LobbyStatus extends View
{
	template = '<span class = "lobby-status-message" cv-bind = "message"></span>';
	preserve = true;
}
