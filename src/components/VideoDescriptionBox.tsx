import { useState } from 'react';
import { getTimeAgoFormat } from '@/lib/date-time';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import TooltipComponent from './TooltipComponent';

interface ComponentProps {
  totalViews?: number;
  description?: string;
  createdAt?: string;
}

const VideoDescriptionBox = (props: ComponentProps) => {
  const { totalViews, description, createdAt } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="px-4 rounded-md bg-secondary/40 py-4">
      {/* Views and timestamp */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          {totalViews ? totalViews.toLocaleString() : 0} views •{' '}
          {createdAt ? `Streamed ${getTimeAgoFormat(createdAt)}` : ''}
        </p>

        {/* Show more / lest button */}
        {description && description.split(' ').length > 30 && (
          <TooltipComponent
            align="center"
            text={isExpanded ? 'Show less' : 'Show more'}
            children={
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 text-sm"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            }
          />
        )}
      </div>

      {/* Description */}
      <div className="border-t pt-4 mt-3">
        <p
          className={`text-foreground leading-relaxed transition-all duration-300 ${
            isExpanded ? '' : 'line-clamp-3'
          }`}
        >
          {description || 'No Description'}
        </p>
      </div>
    </div>
  );
};

export default VideoDescriptionBox;
