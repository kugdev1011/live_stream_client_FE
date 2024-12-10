import { NavItems } from '@/types/ui/navItem';
import { Frame, History, Import, Rss, ThumbsUp } from 'lucide-react';

export const navItems: NavItems[] = [
  {
    name: 'Home',
    url: '/',
    icon: Frame,
    isActive: true,
  },
  {
    name: 'Subscriptions',
    url: '/subscriptions',
    icon: Rss,
    isActive: false,
  },
  {
    name: 'History',
    url: '/feed/history',
    icon: History,
    isActive: false,
  },
  {
    name: 'Liked Videos',
    url: '/feed/liked',
    icon: ThumbsUp,
    isActive: false,
  },
  {
    name: 'Saved Videos',
    url: '/feed/saved',
    icon: Import,
    isActive: false,
  },
];
