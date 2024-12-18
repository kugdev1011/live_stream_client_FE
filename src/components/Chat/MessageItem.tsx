import { getFormattedDate } from '@/lib/date-time';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { User } from 'lucide-react';

interface ComponentProps {
  isSelfSent: boolean;
  avatarUrl: string;
  displayName: string;
  content: string;
  createdAt?: string;
}

const MessageItem = (props: ComponentProps) => {
  const { isSelfSent, avatarUrl, displayName, content, createdAt } = props;

  return (
    <div className="p-0.5">
      <TooltipProvider>
        <Tooltip>
          <div className="flex gap-1">
            <Avatar className="w-5 h-5 cursor-pointer">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback
                className={`text-xs ${
                  isSelfSent ? 'bg-purple-500' : 'bg-green-500'
                }`}
              >
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <p className="text-justify">{displayName}</p>
          </div>
          <TooltipTrigger asChild>
            <p className="mt-1">{content}</p>
          </TooltipTrigger>
          {createdAt && (
            <TooltipContent className="bg-secondary">
              <p className="text-xs">
                {getFormattedDate(new Date(createdAt), true)}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MessageItem;
