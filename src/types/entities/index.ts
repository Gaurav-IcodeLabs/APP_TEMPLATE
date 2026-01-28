import { Listing } from "./listing";
import { Message, Transaction } from "./transaction";
import { User } from "./user";
import { Booking } from "./booking";
import { Image } from "../common/images";
import { Review } from "./review";
import { StripeAccount } from "./stripe";

export type Entity = Listing | User | Transaction | Booking | Image | Review | Message | StripeAccount;