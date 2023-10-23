import { semanticColors } from '@nextui-org/react';

export default function createContrastForeground(hex: string): string {
  const white = (semanticColors.dark.foreground as any).DEFAULT;
  const black = (semanticColors.light.foreground as any).DEFAULT;

  const hexR = parseInt(hex.substr(1, 2), 16);
  const hexG = parseInt(hex.substr(3, 2), 16);
  const hexB = parseInt(hex.substr(5, 2), 16);

  const whiteR = parseInt(white.substr(1, 2), 16);
  const whiteG = parseInt(white.substr(3, 2), 16);
  const whiteB = parseInt(white.substr(5, 2), 16);

  const blackR = parseInt(black.substr(1, 2), 16);
  const blackG = parseInt(black.substr(3, 2), 16);
  const blackB = parseInt(black.substr(5, 2), 16);

  const whiteDistance = Math.sqrt((hexR - whiteR) ** 2 + (hexG - whiteG) ** 2 + (hexB - whiteB) ** 2);
  const blackDistance = Math.sqrt((hexR - blackR) ** 2 + (hexG - blackG) ** 2 + (hexB - blackB) ** 2);

  return whiteDistance < blackDistance ? black : white;
}
