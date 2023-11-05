import { DataWorkspace } from 'types/Common';

const dataWorkspaces: Record<'specs' | 'peripherals' | 'audio' | 'other', DataWorkspace[]> = {
  specs: [
    {
      title: 'CPU',
      value: 'AMD Ryzen 5 3600',
    },
    {
      title: 'RAM',
      value: '48GB (32 + 16) DDR4 3600MHz',
    },
    {
      title: 'GPU',
      value: 'Nvidia GeForce RTX 2060 Super',
    },
    {
      title: 'Storage',
      value: '256GB SSD + 4TB HDD',
    },
    {
      title: 'OS',
      value: 'Windows 11 Pro',
    },
  ],
  peripherals: [
    {
      title: 'Primary Monitor',
      value: 'LG 25UM58-P 25" Ultrawide 21:9 IPS Monitor',
    },
    {
      title: 'Secondary Monitor',
      value: 'BenQ G610HDAL 15.6" 16:9 LED Monitor',
    },
    {
      title: 'Mouse',
      value: 'Logitech MX Master 3',
    },
    {
      title: 'Keyboard',
      value: 'Keychron K2 with 78g Gateron Brown Switches',
    },
    {
      title: 'Gamepad',
      value: 'Rexus Daxa AX1 Asteria',
    },
    {
      title: 'PC Case',
      value: 'Tecware Nexus C',
    },
  ],
  audio: [
    {
      title: 'Interface',
      value: 'Behringer U-phoria UMC22',
    },
    {
      title: 'Microphone',
      value: 'Taff Studio LGT240',
    },
    {
      title: 'Headphone',
      value: 'Audio Technica ATH-M40x',
    },
    {
      title: 'Earphone',
      value: 'Kz CCA CRA',
    },
    {
      title: 'Speaker',
      value: 'Logitech Z213 2.1 Speakers',
    },
  ],
  other: [
    {
      title: 'Weeb Stuff#1',
      value: 'PACIFIC RACING TEAM x ぶいすぽっ！ 小森めと Acrylic Stand',
      url: 'https://shop.geekjack.net/collections/pacific-racing-project-vspo/products/pacific-racing-project-vspo-komori-met-is-my-fave-course',
    },
  ],
};

export default dataWorkspaces;
