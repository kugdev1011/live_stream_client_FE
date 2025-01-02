import useUserAccount from '@/hooks/useUserAccount';
import DefaultPf from '@/assets/images/pf.png';
import AuthImage from './AuthImage';

const StreamerAvatar = () => {
  const currentUser = useUserAccount();

  return (
    <div className="flex gap-2">
      <AuthImage
        className="w-10 h-10 cursor-pointer"
        type="avatar"
        src={currentUser?.avatar_file_name || DefaultPf}
        alt={currentUser?.display_name || 'Unknown'}
      />
      <div>
        <h4>{currentUser.display_name || 'Unknown'}</h4>
        <p className="text-muted-foreground text-sm">
          @{currentUser?.username}
        </p>
      </div>
    </div>
  );
};

export default StreamerAvatar;
