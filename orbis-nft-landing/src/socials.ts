import { Github, Mail, Twitter, type LucideIcon } from "lucide-react";

export interface Social {
	label: string;
	href: string;
	Icon: LucideIcon;
}

export const SOCIALS: Social[] = [
	{ label: "Email", href: "mailto:signal@orbis.nft", Icon: Mail },
	{ label: "Twitter", href: "https://twitter.com", Icon: Twitter },
	{ label: "Github", href: "https://github.com", Icon: Github },
];
