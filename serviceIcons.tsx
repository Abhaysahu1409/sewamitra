import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  PaintRoller,
  Flower2,
  Car,
  HelpCircle,
} from 'lucide-react';

export const SERVICE_ICONS: Record<string, typeof Wrench> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Cleaning: Sparkles,
  Carpentry: Hammer,
  Painting: PaintRoller,
  Gardening: Flower2,
  Driving: Car,
};

export const SERVICE_COLORS: Record<string, string> = {
  Plumbing: 'from-blue-500 to-cyan-500',
  Electrical: 'from-amber-500 to-orange-500',
  Cleaning: 'from-teal-500 to-emerald-500',
  Carpentry: 'from-amber-700 to-yellow-700',
  Painting: 'from-pink-500 to-rose-500',
  Gardening: 'from-green-500 to-lime-500',
  Driving: 'from-slate-600 to-slate-800',
};

export function getServiceIcon(service: string) {
  return SERVICE_ICONS[service] || HelpCircle;
}

export function getServiceColor(service: string) {
  return SERVICE_COLORS[service] || 'from-slate-500 to-slate-700';
}
