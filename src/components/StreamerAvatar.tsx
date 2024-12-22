import { USER_ROLE } from '@/data/types/role';
import useUserAccount from '@/hooks/useUserAccount';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'lucide-react';
import DefaultPf from '@/assets/images/pf.png';

const StreamerAvatar = () => {
  const currentUser = useUserAccount();

  if (currentUser.role_type !== USER_ROLE.STREAMER) return;

  return (
    <div className="flex gap-2">
      <Avatar className="w-10 h-10 cursor-pointer">
        <AvatarImage src={currentUser.avatar_file_name || DefaultPf} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h4>{currentUser.display_name}</h4>
        <p className="text-muted-foreground text-sm">542k subscribers</p>
      </div>
    </div>
  );
};

export default StreamerAvatar;
