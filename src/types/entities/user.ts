import { UUID } from '../common/types';
import { Image } from '../common/images';

export interface UserAttributes {
  banned?: boolean;
  deleted?: boolean;
  profile?: {
    displayName?: string;
    abbreviatedName?: string;
    bio?: string;
  };
}

export interface AuthorAttributes {
  profile?: {
    displayName?: string;
    abbreviatedName?: string;
    bio?: string;
  };
}

export interface DeletedUserAttributes {
  deleted: boolean;
}

export interface BannedUserAttributes {
  banned: boolean;
}

// Denormalised user object
export interface User {
  id: UUID;
  type: 'user';
  attributes: UserAttributes | AuthorAttributes | DeletedUserAttributes | BannedUserAttributes;
  profileImage?: Image;
}

export interface CurrentUserAttributes {
  banned: boolean;
  email: string;
  emailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    abbreviatedName: string;
    bio?: string;
  };
  stripeConnected?: boolean;
}

export interface CurrentUserBannedAttributes {
  banned: boolean;
}

export interface CurrentUserDeletedAttributes {
  deleted: boolean;
}

// Denormalised currentUser object
export type CurrentUser = {
  id: UUID;
  type: 'currentUser';
  attributes: CurrentUserAttributes;
  profileImage?: Image;
  stripeAccount?: any; // TODO: Define StripeAccount type
} | {
  id: UUID;
  type: 'currentUser';
  attributes: CurrentUserBannedAttributes;
} | {
  id: UUID;
  type: 'currentUser';
  attributes: CurrentUserDeletedAttributes;
};
