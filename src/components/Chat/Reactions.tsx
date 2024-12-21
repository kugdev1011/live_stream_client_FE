import { Reaction, ReactionIcons, ReactionStats } from '@/data/chat';
import { Button } from '../ui/button';

export interface OnReactOnLiveParams {
  reaction: Reaction;
}

interface ComponentProps {
  stats: {
    likeCount: number;
    likeInfo: ReactionStats;
    currentReactionType?: Reaction;
  };
  onReactOnLive: (params: OnReactOnLiveParams) => void;
}

const formatCount = (count: number | undefined): string => {
  if (count === undefined) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
};

const Reactions = (props: ComponentProps) => {
  const { stats, onReactOnLive } = props;

  const reactions = Object.values(Reaction);

  return (
    <div
      className="flex justify-between items-center px-0 overflow-x-auto scrollbar-hide  no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {reactions.map((reaction) => {
        const isActive = stats.currentReactionType === reaction;

        const reactionCount = formatCount(stats.likeInfo[reaction]);

        return (
          <Button
            onClick={() => onReactOnLive({ reaction })}
            variant="ghost"
            size="sm"
            className={`rounded-full ${
              isActive ? 'bg-primary hover:bg-primary' : 'bg-transparent'
            }`}
            key={reaction}
          >
            <div className="flex items-center gap-1">
              <p className="text-lg">{ReactionIcons[reaction]}</p>
              {reactionCount && (
                <span
                  className={`text-[9px] ${
                    isActive ? 'text-white' : 'text-black dark:text-white'
                  } `}
                >
                  {reactionCount}
                </span>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default Reactions;
