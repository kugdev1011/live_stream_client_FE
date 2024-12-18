export type StreamInitializeFields = {
  title: string;
  description: string | undefined;
  categories: string[];
  streamType: STREAM_TYPE;
  thumbnailImage: File | null;
};

export enum STREAM_TYPE {
  'CAMERA' = 'camera',
  'SOFTWARE' = 'software',
}
