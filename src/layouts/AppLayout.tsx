import { SidebarInset, SidebarProvider } from '@/components/CustomSidebar';
import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import { SearchProvider } from '@/context/SearchContext';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <ThemeProvider>
      <SearchProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            {/* enable for animation for drawer bounce back */}
            {/* <div vaul-drawer-wrapper="" className="bg-background"> */}
            <main className="flex flex-1 flex-col gap-4 p-6 pt-4 overflow-hidden mt-[56px]">
              {children}
              <Toaster />
            </main>
            {/* </div> */}
          </SidebarInset>
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );
};

export default AppLayout;
