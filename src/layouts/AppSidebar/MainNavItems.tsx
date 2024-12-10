import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { navItems } from '@/data/mainNavItems';
import { HOME_PATH } from '@/data/route';
import { NavLink, useLocation } from 'react-router-dom';

export function MainNavItems() {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navItems.map((item) => (
          <NavLink to={item.url} end={item.url === HOME_PATH} key={item.url}>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === item.url}
                tooltip={item.name}
              >
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </NavLink>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
