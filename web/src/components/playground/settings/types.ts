export type ControlType = 'leftHand' | 'rightHand' | 'mouth' | 'position' | 'bothHands' | 'head' | 'topOfHead';

export interface SelectedAsset {
  instanceId: string;
  assetId: string;
  controlType: ControlType;
  scale: number;
}

export interface PlaygroundSettings {
  selectedAssets: SelectedAsset[];
}

export const DEFAULT_SETTINGS: PlaygroundSettings = {
  selectedAssets: [
    {
      instanceId: 'default-xbot',
      assetId: 'xbot',
      controlType: 'bothHands',
      scale: 1,
    },
  ],
};

export const CONTROL_TYPES: { value: ControlType; label: string }[] = [
  { value: 'bothHands', label: 'Both Hands' },
  { value: 'rightHand', label: 'Right Hand' },
  { value: 'leftHand', label: 'Left Hand' },
  { value: 'head', label: 'Head' },
  { value: 'topOfHead', label: 'Top of Head' },
  { value: 'mouth', label: 'Mouth' },
  { value: 'position', label: 'Fixed Position' },
];
