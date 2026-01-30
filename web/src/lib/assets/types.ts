'use client';

import { FC } from 'react';

export type ControlType = 'leftHand' | 'rightHand' | 'mouth' | 'position' | 'bothHands' | 'head' | 'topOfHead';

export interface AssetComponentProps {
  // Common props all asset components can receive
}

export interface AssetComponent extends FC<AssetComponentProps> {
  displayName: string;
  description: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  component: AssetComponent;
  url: string;
  scale: number;
  animations?: string[];
  defaultControlType: ControlType;
}
