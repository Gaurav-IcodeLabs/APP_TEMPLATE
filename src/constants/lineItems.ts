// Line item types
export const LINE_ITEM_NIGHT = 'line-item/night';
export const LINE_ITEM_DAY = 'line-item/day';
export const LINE_ITEM_HOUR = 'line-item/hour';
export const LINE_ITEM_FIXED = 'line-item/fixed';
export const LINE_ITEM_ITEM = 'line-item/item';
export const LINE_ITEM_OFFER = 'line-item/offer';
export const LINE_ITEM_REQUEST = 'line-item/request';
export const LINE_ITEM_CUSTOMER_COMMISSION = 'line-item/customer-commission';
export const LINE_ITEM_PROVIDER_COMMISSION = 'line-item/provider-commission';
export const LINE_ITEM_SHIPPING_FEE = 'line-item/shipping-fee';
export const LINE_ITEM_PICKUP_FEE = 'line-item/pickup-fee';

export const LINE_ITEMS = [
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_FIXED,
  LINE_ITEM_ITEM,
  LINE_ITEM_OFFER,
  LINE_ITEM_REQUEST,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LINE_ITEM_SHIPPING_FEE,
  LINE_ITEM_PICKUP_FEE,
] as const;

export const LISTING_UNIT_TYPES = [
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_FIXED,
  LINE_ITEM_ITEM,
  LINE_ITEM_OFFER,
  LINE_ITEM_REQUEST,
] as const;

export const STOCK_ONE_ITEM = 'oneItem';
export const STOCK_MULTIPLE_ITEMS = 'multipleItems';
export const STOCK_INFINITE_ONE_ITEM = 'infiniteOneItem';
export const STOCK_INFINITE_MULTIPLE_ITEMS = 'infiniteMultipleItems';
export const STOCK_INFINITE_ITEMS = [STOCK_INFINITE_ONE_ITEM, STOCK_INFINITE_MULTIPLE_ITEMS];
export const STOCK_TYPES = [
  STOCK_ONE_ITEM,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_ONE_ITEM,
  STOCK_INFINITE_MULTIPLE_ITEMS,
] as const;

export const AVAILABILITY_ONE_SEAT = 'oneItem';
export const AVAILABILITY_MULTIPLE_SEATS = 'multipleSeats';
export const AVAILABILITY_TYPES = [AVAILABILITY_ONE_SEAT, AVAILABILITY_MULTIPLE_SEATS] as const;

// Date type options
export const DATE_TYPE_DATE = 'date';
export const DATE_TYPE_TIME = 'time';
export const DATE_TYPE_DATETIME = 'datetime';

export const DATE_TYPES = [DATE_TYPE_DATE, DATE_TYPE_TIME, DATE_TYPE_DATETIME] as const;
