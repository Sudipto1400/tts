import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-500/15 dark:bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        <strong>অফলাইন মোড:</strong> আপনি বর্তমানে ইন্টারনেট সংযোগ ছাড়া আছেন। লোকাল স্পিচ সিন্থেসাইজার এবং পূর্বের সংরক্ষিত অডিওগুলো অফলাইনে কাজ করছে।
      </span>
    </div>
  );
};
