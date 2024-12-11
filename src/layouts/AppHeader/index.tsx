import { SearchBox } from '@/layouts/AppHeader/SearchBox';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { siteData } from '@/data/site';
import UserAvatar from './UserAvatar';

const AppHeader = () => {
  return (
    <header className="flex sticky top-0 py-3 bg-background border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:py-3">
      <div className="px-4 flex items-center gap-1 md:hidden">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          {siteData.logo && <siteData.logo />}
        </div>
        <SidebarTrigger />
      </div>
      <div className="flex px-4 justify-between items-center w-full">
        <div className="ml-auto flex gap-3 items-center">
          <SearchBox />
          <Separator orientation="vertical" className="h-4" />
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
