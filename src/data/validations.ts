import { z } from 'zod';

export const PasswordRules = {
  min: 8,
  max: 12,
};

export const ChangePasswordRules = [
  {
    text: 'at least 8 characters',
    regex: /.{8,}/,
  },
  {
    text: 'at least one uppercase letter',
    regex: /[A-Z]/,
  },
  {
    text: 'at least one lowercase letter',
    regex: /[a-z]/,
  },
  {
    text: 'at least one number',
    regex: /[0-9]/,
  },
  {
    text: 'at least one special character',
    regex: /[@$!%*?&#]/,
  },
];

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().nonempty('Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'New password must contain at least one number')
      .regex(
        /[@$!%*?&#]/,
        'New password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const StreamInitializeRules = {
  title: {
    min: 1,
    max: 100,
  },
};

export const MAX_CATEGORY_COUNT = 3;
export const TWO_FA_OTP_CODE_LENGTH = 6;
