type NextUIColorVar =
  | singularColor
  | contentColor
  | dividerColor
  | colorKeys<'primary'>
  | colorKeys<'secondary'>
  | colorKeys<'foreground'>
  | colorKeys<'default'>
  | colorKeys<'success'>
  | colorKeys<'warning'>
  | colorKeys<'danger'>;
type singularColor = 'background' | 'focus' | 'overlay';
type dividerColor = 'divider';
type contentColor =
  | 'content1'
  | 'content1-foreground'
  | 'content2'
  | 'content2-foreground'
  | 'content3'
  | 'content3-foreground'
  | 'content4'
  | 'content4-foreground';
type colorKeys<T = string> = T extends string
  ?
      | `${T}`
      | `${T}-foreground`
      | `${T}-50`
      | `${T}-100`
      | `${T}-200`
      | `${T}-300`
      | `${T}-400`
      | `${T}-500`
      | `${T}-600`
      | `${T}-700`
      | `${T}-800`
      | `${T}-900`
  : never;

export default function getNextUIColor(colorVar: NextUIColorVar, opacity: number = 1) {
  if (opacity > 1 || opacity < 0) throw new Error('Opacity must be between 0 and 1');

  if (colorVar === 'divider') {
    return `hsl(var(--nextui-divider)/var(--nextui-divider-opacity))`;
  } else {
    return `hsl(var(--nextui-${colorVar})/${opacity})`;
  }
}
