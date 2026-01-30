'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Canvas3D } from '@/components/threejs/Canvas3D';
import { assets, getAssetById } from '@/lib/assets';

export default function ThreeJSPage() {
  const [activeAsset, setActiveAsset] = useState(assets[0]?.id || '');

  const asset = getAssetById(activeAsset);
  const AssetComponent = asset?.component;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[250px] border-r border-border bg-background p-4 overflow-y-auto">
          <h2 className="mb-4 text-lg font-semibold">3D Assets</h2>
          <nav className="space-y-1">
            {assets.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveAsset(a.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeAsset === a.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                {a.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1 overflow-hidden rounded-xl border border-border">
            <Canvas3D>
              {AssetComponent && <AssetComponent />}
            </Canvas3D>
          </div>
          {asset && (
            <div className="mt-3">
              <h2 className="text-lg font-semibold">{asset.name}</h2>
              <p className="text-sm text-muted-foreground">
                {asset.description}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
