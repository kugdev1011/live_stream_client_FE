import { NavItems } from '@/types/ui/navItem';
import { Frame, History, Import, Podcast, Rss, ThumbsUp } from 'lucide-react';
import {
  HISTORY_PATH,
  HOME_PATH,
  LIKED_VIDEOS_PATH,
  SAVED_VIDEOS_PATH,
  SUBSCRIPTIONS_PATH,
  TEST_LIVE_STREAM_PATH,
} from './route';

export const navItems: NavItems[] = [
  {
    name: 'Home',
    url: HOME_PATH,
    icon: Frame,
    isActive: true,
  },
  {
    name: 'Subscriptions',
    url: SUBSCRIPTIONS_PATH,
    icon: Rss,
    isActive: false,
  },
  {
    name: 'History',
    url: HISTORY_PATH,
    icon: History,
    isActive: false,
  },
  {
    name: 'Liked Videos',
    url: LIKED_VIDEOS_PATH,
    icon: ThumbsUp,
    isActive: false,
  },
  {
    name: 'Saved Videos',
    url: SAVED_VIDEOS_PATH,
    icon: Import,
    isActive: false,
  },
  {
    name: 'Test Live Stream',
    url: TEST_LIVE_STREAM_PATH,
    icon: Podcast,
    isActive: false,
  },
];
