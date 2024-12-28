import { CONTENT_STATUS } from '../types/stream';

export interface StreamDetailsResponse {
  id: number | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  broadcast_url: string | null;
  push_url: string | null;
  started_at?: string | null;
  category_ids: number[];
}

export type VideosListRequest = {
  page?: number;
  limit?: number;
  status?: CONTENT_STATUS;
  title?: string;
  categoryId1?: number;
  categoryId2?: number;
  categoryId3?: number;
  isMe?: boolean;
};

export interface StreamsResponse {
  id: number;
  title: string;
  thumbnail_url: string;
  status: CONTENT_STATUS;
  broadcast_url: string;
  video_url: string;
  started_at: string;
  user_id: number;
  display_name: string;
  avatar_file_url: string;
  views: number;
  likes: number;
  comments: number;
  duration: number;
}
