import {
  SiDevdotto,
  SiDevdottoHex,
  SiDiscord,
  SiDiscordHex,
  SiFacebook,
  SiFacebookHex,
  SiGithub,
  SiGithubHex,
  SiLinkedin,
  SiLinkedinHex,
  SiX,
  SiXHex,
} from '@icons-pack/react-simple-icons';

import { DataSocials } from 'types/Common';

const dataSocials: DataSocials[] = [
  {
    name: 'Github',
    icon: SiGithub,
    href: 'https://www.github.com/mbaharip',
    color: SiGithubHex,
  },
  {
    name: 'Facebook',
    icon: SiFacebook,
    href: 'https://www.facebook.com/mbaharip07',
    color: SiFacebookHex,
  },
  {
    name: 'X',
    icon: SiX,
    href: 'https://www.x.com/mbaharip_',
    color: SiXHex,
  },
  {
    name: 'Dev',
    icon: SiDevdotto,
    href: 'https://dev.to/mbaharip',
    color: SiDevdottoHex,
  },
  {
    name: 'Discord',
    icon: SiDiscord,
    href: 'https://discord.com/users/652155604172931102',
    color: SiDiscordHex,
  },
  {
    name: 'LinkedIn',
    icon: SiLinkedin,
    href: 'https://www.linkedin.com/in/mbaharip/',
    color: SiLinkedinHex,
  },
];

export default dataSocials;
