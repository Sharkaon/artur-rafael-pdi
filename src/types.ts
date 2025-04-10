
type Red = number;
type Blue = number;
type Green = number;
// Transparency
export type AlphaChannel = number;

export type RGBPixel = [Red, Green, Blue, AlphaChannel]
export type RGBLine = RGBPixel[];

export type RGBImageMatrix = RGBLine[];

export type Effect = 
  | 'grayscale'
  | 'contrast'
  | 'translate'
  | 'brightness'
  | 'scale'
  | 'filter'
  | 'threshold'
  | 'borders'
  | 'mirror'
  | 'rotate';

export type EffectParams =
  | { type: 'grayscale' } // No additional parameters for grayscale
  | { type: 'threshold'; threshold: number } // Threshold effect requires a `threshold` parameter
  | { type : 'rotate'; angular: number}
