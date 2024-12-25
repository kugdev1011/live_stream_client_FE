import { VideoOff } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="child-center">
      <div className="flex flex-col justify-center items-center space-y-3">
        <div className="bg-primary/70 dark:bg-primary/50 p-2 rounded-full">
          <VideoOff className="text-white" />
        </div>
        <p className="text-base font-medium">No Videos Found!</p>
        <span className="text-sm">
          Please try searching with different filters.
        </span>
      </div>
    </div>
  );
};

export default NotFound;
