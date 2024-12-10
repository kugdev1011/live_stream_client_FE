import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LOGIN_PATH } from '@/data/route';
import { getFormattedDate } from '@/lib/date-time';
import BgImage from '@/assets/images/login-bg.jpg';

const LogoutPage = () => {
  const navigate = useNavigate();

  const handleGoToLoginPage = () => navigate(LOGIN_PATH);

  return (
    <div className="relative w-full overflow-hidden min-h-[600px] lg:min-h-[800px] lg:flex">
      <div className="absolute lg:static inset-0 z-0 lg:block lg:w-1/2">
        <img
          src={BgImage}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="relative z-10 lg:w-1/2 h-screen flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-white mx-auto grid w-full max-w-md gap-6 shadow-lg lg:shadow-none p-8 rounded-lg">
          <div className="text-center flex flex-col items-center justify-center">
            <div className="rounded-full p-3 bg-slate-200">
              <LogOut className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-3xl text-black font-bold mt-3">Logged out</h1>
            <p className="text-balance text-muted-foreground mt-3">
              You have logged out from the system <br />
              at{' '}
              <Badge variant="destructive">
                {getFormattedDate(new Date(), true)}
              </Badge>
              .
            </p>
          </div>
          <Button className="mt-5" onClick={handleGoToLoginPage}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
