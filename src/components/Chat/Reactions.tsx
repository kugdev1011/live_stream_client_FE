import { Reaction, ReactionIcons, ReactionStats } from '@/data/chat';
import { Button } from '../ui/button';
import { formatReactionCount } from '@/lib/utils';

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
        const isActive = stats?.currentReactionType === reaction;

        const reactionCount = formatReactionCount(stats.likeInfo[reaction]);

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
