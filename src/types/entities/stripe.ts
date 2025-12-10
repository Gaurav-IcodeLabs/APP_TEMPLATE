import { UUID } from '../common/types';

// A Stripe account entity
export interface StripeAccount {
  id: UUID;
  type: 'stripeAccount';
  attributes: {
    stripeAccountId: string;
    stripeAccountData?: any;
  };
}

export interface StripePaymentMethod {
  id: UUID;
  type: 'stripePaymentMethod';
  attributes: {
    type: 'stripe-payment-method/card';
    stripePaymentMethodId: string;
    card: {
      brand: string;
      expirationMonth: number;
      expirationYear: number;
      last4Digits: string;
    };
  };
}
