import { CategoryResponse } from '@/data/dto/category';
import { StreamDetailsResponse } from '@/data/dto/stream';
import { getFormattedDate } from '@/lib/date-time';
import { getObjectsByIds, convertToHashtagStyle } from '@/lib/utils';
import React from 'react';

const StreamDetailsCard: React.FC<{
  data: StreamDetailsResponse;
  categories: CategoryResponse[];
}> = ({ data, categories }) => {
  return (
    <div className="backdrop-blur bg-white/30 dark:bg-black/50">
      {data?.thumbnail_url && (
        <img
          src={data?.thumbnail_url}
          alt={data.title || 'Thumbnail'}
          className="w-full h-48 object-cover rounded-t"
        />
      )}
      <div className="pt-3">
        <p className="text-xs">
          <span className="text-muted-foreground">Streamed live at</span>{' '}
          {getFormattedDate(new Date(data?.started_at || new Date()), true)}
        </p>
        <h2 className="text-lg font-semibold">{data?.title || 'No Title'}</h2>
        <p className="text-blue-400">
          {getObjectsByIds(categories, data?.category_ids || [], 'id').map(
            (category) => {
              return convertToHashtagStyle(category.name) + ' ';
            }
          )}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {data?.description || 'No Description'}
        </p>
      </div>
    </div>
  );
};

export default StreamDetailsCard;
