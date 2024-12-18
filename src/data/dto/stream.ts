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
