import { TFunction } from 'i18next';
import { z } from 'zod';

export const getLoginSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('Login.emailIsRequired')),
    password: z.string().min(8, t('Login.passwordIsRequired')),
  });
