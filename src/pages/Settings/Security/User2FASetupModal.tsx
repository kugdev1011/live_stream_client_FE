import FormErrorMessage from '@/components/FormErrorMsg';
import RequiredInput from '@/components/RequiredInput';
import { Button } from '@/components/ui/button';
import {
  DrawerModal,
  DrawerModalContent,
  DrawerModalDescription,
  DrawerModalHeader,
  DrawerModalTitle,
} from '@/components/ui/drawer-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User2FACheckResponse } from '@/data/dto/user';
import { cn } from '@/lib/utils';
import { verity2FactorAuthWithOTP, Verity2FAError } from '@/services/user';
import { RotateCw, Smartphone } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type User2FAFormError = {
  actionFailure: boolean;
  codeToVerifyFailure: boolean;
};

interface ComponentProps {
  isOpen: boolean;
  data: User2FACheckResponse;
  onOpenChange: (value: boolean) => void;
  onRegenerate2FA: () => void;
  onVerifySuccess: () => void;
}

const User2FASetupModal = (props: ComponentProps) => {
  const {
    data: twoFAData,
    isOpen,
    onOpenChange,
    onRegenerate2FA,
    onVerifySuccess,
  } = props;

  const codeToVerifyInput = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<User2FAFormError>({
    actionFailure: false,
    codeToVerifyFailure: false,
  });

  const onCodeSubmit = async (event: React.SyntheticEvent): Promise<void> => {
    event.preventDefault();

    setIsLoading(true);
    const codeToVerify = codeToVerifyInput.current?.value || '';

    const { data, errors: _errors } = await verity2FactorAuthWithOTP(
      codeToVerify
    );
    setIsLoading(false);

    if (data && data?.is_verified) {
      onVerifySuccess();
    } else {
      if (_errors) {
        const formError: User2FAFormError = {
          codeToVerifyFailure: _errors?.[Verity2FAError.INVALID_OTP] || false,
          actionFailure: _errors?.[Verity2FAError.ACTION_FAILURE] || false,
        };

        const { codeToVerifyFailure } = formError;
        setFormError((prevError: User2FAFormError) => ({
          ...prevError,
          codeToVerifyFailure,
        }));
      }
    }
  };

  const handleCodeToVerifyChange = (): void => {
    const error = {
      codeToVerifyFailure: false,
      actionFailure: false,
    };

    setFormError((prevState: User2FAFormError) => ({
      ...prevState,
      ...error,
    }));
  };

  const handleCopySetupKeyToClipboard = async () => {
    if (twoFAData && twoFAData.secret) {
      try {
        await navigator.clipboard.writeText(twoFAData.secret);
        toast('Copied setup key to your clipboard.');
      } catch (error) {
        console.error('Failed to copy:', error);
        toast("Can't copy setup key.");
      }
    }
  };

  const { actionFailure, codeToVerifyFailure } = formError;
  let invalidCodeError = null,
    somethingWrongError = null;
  if (codeToVerifyFailure) invalidCodeError = <div>Invalid OTP code.</div>;
  if (actionFailure) {
    somethingWrongError = <div>Something went wrong.</div>;
    invalidCodeError = '';
  }

  const codeInputInvalid = codeToVerifyFailure || actionFailure;

  return (
    <DrawerModal open={isOpen} onOpenChange={onOpenChange}>
      <DrawerModalContent className="sm:max-w-[768px] space-y-4 px-5 pb-5">
        <DrawerModalHeader className="p-0">
          <DrawerModalTitle className="text-xl font-semibold">
            <div className="flex gap-2 items-center">
              <Smartphone />
              Setup 2FA with authenticator app
            </div>
          </DrawerModalTitle>
          <DrawerModalDescription className="mt-5 text-left">
            Authenticator apps and browser extensions like 1Password, Authy,
            Microsoft Authenticator, etc. generate one-time passwords that are
            used as second factor to verify your identity when prompted during
            sign-in.
          </DrawerModalDescription>
        </DrawerModalHeader>

        <div>
          <p className="text-md font-medium">Scan the QR Code</p>
          <p className="text-sm text-muted-foreground">
            Use and authenticator app or browser extension to scan.
          </p>
          {twoFAData?.qr_code ? (
            <img
              src={`data:image/png;base64,${twoFAData?.qr_code}`}
              alt="QR Code"
              className="w-[200px] h-[200px] rounded-sm mt-3"
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-sm mt-3 border border-dashed flex flex-col justify-center items-center text-center text-sm">
              Error getting QR code. <br />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  onRegenerate2FA();
                }}
              >
                <RotateCw className="h-3 w-3" /> Regenerate
              </Button>
            </div>
          )}

          {twoFAData?.qr_code && (
            <p className="text-sm text-muted-foreground mt-5">
              Unable to scan? You can use the{' '}
              <span
                onClick={handleCopySetupKeyToClipboard}
                className="text-blue-500 underline underline-offset-4 hover:cursor-pointer"
                title="Click to copy"
              >
                setup key
              </span>{' '}
              to manually configure your authenticator app.
            </p>
          )}
        </div>

        <form onSubmit={onCodeSubmit}>
          <Label htmlFor="code">
            Verify the code from the app <RequiredInput />
          </Label>
          <Input
            ref={codeToVerifyInput}
            onChange={handleCodeToVerifyChange}
            id="code"
            placeholder="XXXXXX"
            type="text"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            className={cn('w-full md:w-1/3 mt-2', {
              'ring-red-500 border-red-500': codeInputInvalid,
            })}
          />
          {invalidCodeError && (
            <FormErrorMessage classes="mt-1" message={invalidCodeError} />
          )}
          {somethingWrongError && (
            <FormErrorMessage classes="mt-1" message={somethingWrongError} />
          )}

          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </form>
      </DrawerModalContent>
    </DrawerModal>
  );
};

export default User2FASetupModal;
