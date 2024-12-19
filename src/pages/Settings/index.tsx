import { SettingsTabs } from '@/data/types/ui/settingTabs';
import AppLayout from '@/layouts/AppLayout';
import LayoutHeading from '@/layouts/LayoutHeading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountInformation from './AccountInformation';
import Security from './Security';
import { useEffect, useState } from 'react';

const title = 'Settings';

enum SETTINGS_TABS {
  ACCOUNT_INFO = 'account-info',
  SECURITY = 'security',
}

const tabs: SettingsTabs[] = [
  {
    label: 'Account Information',
    value: SETTINGS_TABS.ACCOUNT_INFO,
    Page: <AccountInformation />,
  },
  {
    label: 'Security',
    value: SETTINGS_TABS.SECURITY,
    Page: <Security />,
  },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>(
    SETTINGS_TABS.ACCOUNT_INFO
  );

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (tabs.some((tab) => tab.value === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  return (
    <AppLayout title={title}>
      <LayoutHeading title={title} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(
          (tab) =>
            activeTab === tab.value && (
              <TabsContent key={tab.value} className="mt-4" value={tab.value}>
                {tab.Page}
              </TabsContent>
            )
        )}
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
