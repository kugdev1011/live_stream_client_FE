import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import useUserAccount from '@/hooks/useUserAccount';
import { UserAccountModel } from '@/data/model/userAccount';
import { useProfileNavItems } from '@/hooks/useProfileNavItems';
import DefaultPf from '@/assets/images/pf.png';
import { EVENT_EMITTER_NAME, EventEmitter } from '@/lib/event-emitter';
import { UserProfileInfoUpdateRequest } from '@/data/dto/user';

const UserAvatar = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  const profileNavItems = useProfileNavItems();
  const currentUser: UserAccountModel = useUserAccount();

  const [user, setUser] = useState({
    username: currentUser?.username,
    displayName: currentUser?.display_name,
    avatarUrl: currentUser?.avatar_file_name || DefaultPf,
  });

  useEffect(() => {
    const handleAccountChange = (updatedUser: UserProfileInfoUpdateRequest) => {
      setUser((prevData) => {
        return {
          ...prevData,
          displayName: updatedUser.displayName,
          avatarUrl:
            typeof updatedUser.avatarFile === 'string'
              ? updatedUser.avatarFile
              : DefaultPf,
        };
      });
    };

    EventEmitter.subscribe(
      EVENT_EMITTER_NAME.USER_PROFILE_UPDATE,
      handleAccountChange
    );

    // Cleanup subscription on unmount
    return () => {
      EventEmitter.unsubscribe(
        EVENT_EMITTER_NAME.USER_PROFILE_UPDATE,
        handleAccountChange
      );
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Avatar className="w-8 h-8 cursor-pointer">
          {/* <AvatarImage src={avatarUrl} /> */}
          <img src={user?.avatarUrl} />
          <AvatarFallback>PF</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 overflow-hidden rounded-lg p-0"
        align="end"
      >
        <Sidebar collapsible="none" className="bg-transparent">
          <SidebarContent>
            <div className="flex gap-2 items-center justify-start py-3 pb-2 px-4">
              <Avatar className="w-8 h-8">
                {/* <AvatarImage src={avatarUrl} /> */}
                <img src={user?.avatarUrl} />
                <AvatarFallback>PF</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-sm">{user?.displayName}</p>
                <p className="text-xs -mt-1">@{user?.username}</p>
              </div>
            </div>
            <Separator />
            {profileNavItems.map((group, index) => (
              <SidebarGroup
                key={index}
                className="border-b last:border-none pt-0"
              >
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                    {group.map((item, index) => (
                      <DropdownMenu key={item.label}>
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton onClick={item?.action}>
                            {item?.id === 'theme' ? (
                              <ModeSwitcher label={item.label} />
                            ) : (
                              <React.Fragment>
                                <item.icon /> <span>{item.label}</span>
                              </React.Fragment>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </DropdownMenu>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
      </PopoverContent>
    </Popover>
  );
});

export default UserAvatar;
