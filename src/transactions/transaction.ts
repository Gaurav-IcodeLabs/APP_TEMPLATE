import * as log from '../util/log';
import * as purchaseProcess from './transactionProcessPurchase';
import * as bookingProcess from './transactionProcessBooking';
import * as inquiryProcess from './transactionProcessInquiry';
import * as negotiationProcess from './transactionProcessNegotiation';
import { Transaction, UUID } from '../types';

/**
 * State configuration in the transaction process
 * Maps transition names to target states
 */
interface ProcessState {
  on?: {
    [transitionName: string]: string; // transition name -> target state name
  };
}

/**
 * Transaction process graph structure
 * Maps state names to their configurations
 */
interface ProcessGraph {
  id: string;

  // This 'initial' state is a starting point for new transaction
  initial: string;
  states: Record<string, ProcessState>;
}

/**
 * States object created from process graph
 * Internal representation used for navigation
 */
interface StatesObject {
  [stateName: string]: ProcessState;
}

// Supported unit types
// Note: These are passed to translations/microcopy in certain cases.
//       Therefore, they can't contain wordbreaks like '-' or space ' '
export const ITEM = 'item';
export const DAY = 'day';
export const NIGHT = 'night';
export const HOUR = 'hour';
export const FIXED = 'fixed';
export const INQUIRY = 'inquiry';
export const OFFER = 'offer'; // The unitType 'offer' means that provider created the listing on default-negotiation process
export const REQUEST = 'request'; // The unitType 'request' means that customer created the listing on default-negotiation process

// Then names of supported processes
export const PURCHASE_PROCESS_NAME = 'default-purchase';
export const BOOKING_PROCESS_NAME = 'default-booking';
export const INQUIRY_PROCESS_NAME = 'default-inquiry';
export const NEGOTIATION_PROCESS_NAME = 'default-negotiation';

/**
 * A process should export:
 * - graph
 * - states
 * - transitions
 * - isRelevantPastTransition(transition)
 * - isPrivileged(transition)
 * - isCompleted(transition)
 * - isRefunded(transition)
 * - isCustomerReview(transition)
 * - isProviderReview(transition)
 * - statesNeedingCustomerAttention
 */
const PROCESSES = [
  {
    name: PURCHASE_PROCESS_NAME,
    alias: `${PURCHASE_PROCESS_NAME}/release-1`,
    process: purchaseProcess,
    unitTypes: [ITEM],
  },
  {
    name: BOOKING_PROCESS_NAME,
    alias: `${BOOKING_PROCESS_NAME}/release-1`,
    process: bookingProcess,
    unitTypes: [DAY, NIGHT, HOUR, FIXED],
  },
  {
    name: INQUIRY_PROCESS_NAME,
    alias: `${INQUIRY_PROCESS_NAME}/release-1`,
    process: inquiryProcess,
    unitTypes: [INQUIRY],
  },
  {
    name: NEGOTIATION_PROCESS_NAME,
    alias: `${NEGOTIATION_PROCESS_NAME}/release-1`,
    process: negotiationProcess,
    unitTypes: [OFFER, REQUEST],
  },
] as const;

/**
 * Complete transaction process definition
 */
type TransactionProcess = (typeof PROCESSES)[number]['process'];

/**
 * Helper functions to figure out if transaction is in a specific state.
 * State is based on lastTransition given by transaction object and state description.
 *
 * @param {Object} tx transaction entity
 */
const txLastTransition = (tx: Transaction) => tx?.attributes?.lastTransition;

/**
 * Get states from the graph.
 *
 * Note: currently we assume that state description is in stateX format
 *       and it doesn't contain nested states.
 *
 * @param graph Description of transaction process graph in StateX format
 */
const statesObjectFromGraph = (graph: ProcessGraph): StatesObject =>
  graph.states || {};

/**
 * This is a helper function that's attached to exported 'getProcess'.
 * Get next process state after given transition.
 *
 * @param process Transaction process module with graph property
 * @returns {function} Returns a function to check the next state after given transition.
 */
const getStateAfterTransition =
  (process: TransactionProcess) => (transition: string) => {
    const statesObj = statesObjectFromGraph(process.graph);
    const stateNames = Object.keys(statesObj);
    const fromState = stateNames.find(stateName => {
      const transitionsForward = Object.keys(statesObj[stateName]?.on || {});
      return transitionsForward.includes(transition);
    });

    return fromState && transition && statesObj[fromState]?.on?.[transition]
      ? statesObj[fromState]?.on[transition]
      : null;
  };

/**
 * This is a helper function that's attached to exported 'getProcess' as 'getState'
 * Get state based on lastTransition of given transaction entity.
 *
 * How to use this function:
 *   // import { getProcess } from '../../transactions/transaction';
 *   const process = getProcess(processName);
 *   const state = process.getState(tx);
 *   const isInquiry = state === process.states.INQUIRY
 *
 * @param {Object} process imported from a separate file
 * @returns {function} Returns a function to check the current state of transaction entity against
 * given process.
 */
const getProcessState = (process: TransactionProcess) => (tx: Transaction) => {
  return getStateAfterTransition(process)(txLastTransition(tx));
};

/**
 * Pick transition names that lead to target state from given entries.
 *
 * First parameter, "transitionEntries", should look like this:
 * [
 *   [transitionForward1, stateY],
 *   [transitionForward2, stateY],
 *   [transitionForward3, stateZ],
 * ]
 *
 * @param {Array} transitionEntries
 * @param {String} targetState
 * @param {Array} initialTransitions
 */
const pickTransitionsToTargetState = (
  transitionEntries: [string, string][],
  targetState: string,
  initialTransitions: string[],
) => {
  return transitionEntries.reduce((pickedTransitions, transitionEntry) => {
    const [transition, nextState] = transitionEntry;
    return nextState === targetState
      ? [...pickedTransitions, transition]
      : pickedTransitions;
  }, initialTransitions);
};

/**
 * Get all the transitions that lead to specified state.
 *
 * Process uses following syntax to describe the graph:
 * states: {
 *   stateX: {
 *     on: {
 *       transitionForward1: stateY,
 *       transitionForward2: stateY,
 *       transitionForward3: stateZ,
 *     },
 *   },
 *   stateY: {},
 *   stateZ: {
 *     on: {
 *       transitionForward4: stateY,
 *     },
 *   },
 * },
 *
 * Finding all the transitions to 'stateY' should pick transitions: 1, 2, 4
 *
 * @param {Object} process
 * @param {String} targetState
 */
const getTransitionsToState = (
  process: TransactionProcess,
  targetState: string,
) => {
  const states = Object.values(statesObjectFromGraph(process.graph));

  return states.reduce((collectedTransitions, inspectedState) => {
    const transitionEntriesForward = Object.entries(inspectedState.on || {});
    return pickTransitionsToTargetState(
      transitionEntriesForward,
      targetState,
      collectedTransitions,
    );
  }, [] as string[]);
};

/**
 * Transitions that lead to given states.
 *
 * @param {Object} process against which transitions and states are checked.
 * @returns {function} Returns a function to get the transitions that lead to given states.
 */
const getTransitionsToStates =
  (process: TransactionProcess) => (stateNames: string[]) => {
    return stateNames.reduce((pickedTransitions, stateName) => {
      return [
        ...pickedTransitions,
        ...getTransitionsToState(process, stateName),
      ];
    }, [] as string[]);
  };

/**
 * Helper functions to figure out if transaction has passed a given state.
 * This is based on transitions history given by transaction object.
 *
 * @param {Object} process against which passed states are checked.
 */
const hasPassedState =
  (process: TransactionProcess) => (stateName: string, tx: Transaction) => {
    const txTransitions = (tx: Transaction) =>
      tx?.attributes?.transitions || [];
    const hasPassedTransition = (transitionName: string, tx: Transaction) =>
      !!txTransitions(tx).find(t => t.transition === transitionName);

    return (
      getTransitionsToState(process, stateName).filter(t =>
        hasPassedTransition(t, tx),
      ).length > 0
    );
  };

/**
 * If process has been renamed, but the graph itself is the same,
 * this function allows referencing the updated name of the process.
 * ProcessName is used in some translation keys and stateData functions.
 *
 * Note: If the process graph has changed, you must create a separate process graph for it.
 *
 * @param {String} processName
 */
export const resolveLatestProcessName = (processName: string) => {
  switch (processName) {
    case 'flex-product-default-process':
    case 'default-buying-products':
    case PURCHASE_PROCESS_NAME:
      return PURCHASE_PROCESS_NAME;
    case 'flex-default-process':
    case 'flex-hourly-default-process':
    case 'flex-booking-default-process':
    case BOOKING_PROCESS_NAME:
      return BOOKING_PROCESS_NAME;
    case INQUIRY_PROCESS_NAME:
      return INQUIRY_PROCESS_NAME;
    case NEGOTIATION_PROCESS_NAME:
      return NEGOTIATION_PROCESS_NAME;
    default:
      return processName;
  }
};

/**
 * Get process based on process name
 * @param {String} processName
 */
export const getProcess = (processName: string) => {
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(
    process => process.name === latestProcessName,
  );
  if (processInfo) {
    return {
      ...processInfo.process,
      getState: getProcessState(processInfo.process),
      getStateAfterTransition: getStateAfterTransition(processInfo.process),
      getTransitionsToStates: getTransitionsToStates(processInfo.process),
      hasPassedState: hasPassedState(processInfo.process),
    };
  } else {
    const error = new Error(`Unknown transaction process name: ${processName}`);
    log.error(error, 'unknown-transaction-process', { processName });
    throw error;
  }
};

/**
 * Get the info about supported processes: name, alias, unitTypes
 */
export const getSupportedProcessesInfo = () =>
  PROCESSES.map(p => {
    const { process, ...rest } = p;
    process;
    return rest;
  });

/**
 * Get all the transitions for every supported process
 */
export const getAllTransitionsForEveryProcess = () => {
  return PROCESSES.reduce((accTransitions, processInfo) => {
    return [
      ...accTransitions,
      ...Object.values(processInfo.process.transitions),
    ];
  }, [] as string[]);
};

/**
 * Check if the process is purchase process
 *
 * @param {String} processName
 */
export const isPurchaseProcess = (processName: string | null) => {
  if (!processName) return false;
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(
    process => process.name === latestProcessName,
  );
  return [PURCHASE_PROCESS_NAME].includes(processInfo?.name || '');
};

/**
 * Check if the process/alias points to a booking process
 *
 * @param {String} processAlias
 */
export const isPurchaseProcessAlias = (processAlias: string) => {
  const processName = processAlias ? processAlias.split('/')[0] : null;
  return processAlias ? isPurchaseProcess(processName) : false;
};

/**
 * Check if the process is booking process
 *
 * @param {String} processName
 */
export const isBookingProcess = (processName: string | null) => {
  if (!processName) return false;
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(
    process => process.name === latestProcessName,
  );
  return [BOOKING_PROCESS_NAME].includes(processInfo?.name || '');
};

/**
 * Check if the process/alias points to a booking process
 *
 * @param {String} processAlias
 */
export const isBookingProcessAlias = (processAlias: string) => {
  const processName = processAlias ? processAlias.split('/')[0] : null;
  return processAlias ? isBookingProcess(processName) : false;
};

/**
 * Check if the process is inquiry process
 *
 * @param {String} processName
 */
export const isInquiryProcess = (processName: string | null) => {
  if (!processName) return false;
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(
    process => process.name === latestProcessName,
  );
  return [INQUIRY_PROCESS_NAME].includes(processInfo?.name || '');
};

/**
 * Check if the process/alias points to a inquiry process
 *
 * @param {String} processAlias
 */
export const isInquiryProcessAlias = (processAlias: string) => {
  const processName = processAlias ? processAlias.split('/')[0] : null;
  return processAlias ? isInquiryProcess(processName) : false;
};

/**
 * Check if the process is negotiation process
 *
 * @param {String} processName
 */
export const isNegotiationProcess = (processName: string | null) => {
  if (!processName) return false;
  const latestProcessName = resolveLatestProcessName(processName);
  const processInfo = PROCESSES.find(
    process => process.name === latestProcessName,
  );
  return [NEGOTIATION_PROCESS_NAME].includes(processInfo?.name || '');
};

/**
 * Check if the process/alias points to a negotiation process
 *
 * @param {String} processAlias
 */
export const isNegotiationProcessAlias = (processAlias: string) => {
  const processName = processAlias ? processAlias.split('/')[0] : null;
  return processAlias ? isNegotiationProcess(processName) : false;
};

/**
 * Check from unit type if full days should be used.
 * E.g. unit type is day or night
 * This is mainly used for availability management.
 *
 * @param {String} unitType
 */
export const isFullDay = (unitType: string) => {
  return [DAY, NIGHT].includes(unitType);
};

/**
 * Get states that need provider's attention for every supported process
 */
export const getStatesNeedingProviderAttention = () => {
  return PROCESSES.reduce((accStates, processInfo) => {
    const statesNeedingProviderAttention =
      processInfo.process.statesNeedingProviderAttention || [];
    // Return only unique state names
    // TODO: this setup is subject to problems if one process has important state named
    // similarly as unimportant state in another process.
    return [...new Set([...accStates, ...statesNeedingProviderAttention])];
  }, [] as string[]);
};

/**
 * Get states that need customer's attention for every supported process
 */
export const getStatesNeedingCustomerAttention = () => {
  return PROCESSES.reduce((accStates, processInfo) => {
    const statesNeedingCustomerAttention =
      'statesNeedingCustomerAttention' in processInfo.process
        ? processInfo.process.statesNeedingCustomerAttention
        : [];
    // Return only unique state names
    // TODO: this setup is subject to problems if one process has important state named
    // similarly as unimportant state in another process.
    return [...new Set([...accStates, ...statesNeedingCustomerAttention])];
  }, [] as string[]);
};

/**
 * Actors
 *
 * There are 4 different actors that might initiate transitions:
 */

// Roles of actors that perform transaction transitions
export const TX_TRANSITION_ACTOR_CUSTOMER = 'customer';
export const TX_TRANSITION_ACTOR_PROVIDER = 'provider';
export const TX_TRANSITION_ACTOR_SYSTEM = 'system';
export const TX_TRANSITION_ACTOR_OPERATOR = 'operator';

export const TX_TRANSITION_ACTORS = [
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  TX_TRANSITION_ACTOR_SYSTEM,
  TX_TRANSITION_ACTOR_OPERATOR,
];

/**
 * Get the role of the current user on given transaction entity.
 *
 * @param {UUID} currentUserId UUID of the currentUser entity
 * @param {Object} transaction Transaction entity from Marketplace API
 */
export const getUserTxRole = (
  currentUserId: UUID,
  transaction: Transaction,
) => {
  const customer = transaction?.customer;
  if (currentUserId && currentUserId.uuid && transaction?.id && customer?.id) {
    // user can be either customer or provider
    return currentUserId.uuid === customer.id.uuid
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER;
  } else {
    throw new Error(`Parameters for "userIsCustomer" function were wrong.
      currentUserId: ${currentUserId}, transaction: ${transaction}`);
  }
};

/**
 * Wildcard string for ConditionalResolver's conditions.
 */
export const CONDITIONAL_RESOLVER_WILDCARD = '*';

/**
 * This class helps to resolve correct UI data for each combination of conditional data [state & role]
 *
 * Usage:
 *  const stateData = new ConditionalResolver([currentState, currentRole])
 *    .cond(['inquiry', 'customer'], () => {
 *      return { showInfoX: true, isSomethingOn: true };
 *    })
 *    .cond(['purchase', _], () => {
 *      return { showInfoX: false, isSomethingOn: true };
 *    })
 *    .default(() => {
 *      return { showDetailCardHeadings: true };
 *    })
 *    .resolve();
 */
// export class ConditionalResolver {
//   constructor(data) {
//     this.data = data;
//     this.resolver = null;
//     this.defaultResolver = null;
//   }
//   cond(conditions, resolver) {
//     if (conditions?.length === this.data.length && this.resolver == null) {
//       const isDefined = item => typeof item !== 'undefined';
//       const isWildcard = item => item === CONDITIONAL_RESOLVER_WILDCARD;
//       const isMatch = conditions.reduce(
//         (isPartialMatch, item, i) =>
//           isPartialMatch &&
//           isDefined(item) &&
//           (isWildcard(item) || item === this.data[i]),
//         true,
//       );
//       this.resolver = isMatch ? resolver : null;
//     }
//     return this;
//   }
//   default(defaultResolver) {
//     this.defaultResolver = defaultResolver;
//     return this;
//   }
//   resolve() {
//     // This resolves the output against current conditions.
//     // Therefore, call for resolve() must be the last call in method chain.
//     return this.resolver
//       ? this.resolver()
//       : this.defaultResolver
//       ? this.defaultResolver()
//       : null;
//   }
// }

/**
 * Type for wildcard in conditional matching
 */
type Wildcard = typeof CONDITIONAL_RESOLVER_WILDCARD;

/**
 * Helper type to allow wildcard in condition arrays
 */
type ConditionValue<T> = T | Wildcard;

/**
 * Type for condition array based on data array length
 */
type ConditionArray<T extends readonly any[]> = {
  [K in keyof T]: ConditionValue<T[K]>;
};

/**
 * Resolver function that returns the result
 */
type ResolverFunction<TResult> = () => TResult;

/**
 * This class helps to resolve correct UI data for each combination of conditional data [state & role]
 *
 * @template TData - Tuple type of the data array (e.g., [string, string])
 * @template TResult - Return type of the resolver functions
 *
 * @example
 * ```typescript
 * interface StateData {
 *   showInfoX: boolean;
 *   isSomethingOn: boolean;
 * }
 *
 * const stateData = new ConditionalResolver<[string, string], StateData>(['inquiry', 'customer'])
 *   .cond(['inquiry', 'customer'], () => {
 *     return { showInfoX: true, isSomethingOn: true };
 *   })
 *   .cond(['purchase', CONDITIONAL_RESOLVER_WILDCARD], () => {
 *     return { showInfoX: false, isSomethingOn: true };
 *   })
 *   .default(() => {
 *     return { showInfoX: false, isSomethingOn: false };
 *   })
 *   .resolve();
 * ```
 */
export class ConditionalResolver<TData extends readonly any[], TResult = any> {
  private data: TData;
  private resolver: ResolverFunction<TResult> | null;
  private defaultResolver: ResolverFunction<TResult> | null;

  /**
   * Create a new ConditionalResolver
   * @param data - Tuple of values to match against (e.g., [currentState, currentRole])
   */
  constructor(data: TData) {
    this.data = data;
    this.resolver = null;
    this.defaultResolver = null;
  }

  /**
   * Add a conditional resolver
   * @param conditions - Array of conditions to match (can use CONDITIONAL_RESOLVER_WILDCARD for any value)
   * @param resolver - Function to execute if conditions match
   * @returns This instance for method chaining
   */
  cond(
    conditions: ConditionArray<TData>,
    resolver: ResolverFunction<TResult>,
  ): this {
    if (conditions?.length === this.data.length && this.resolver == null) {
      const isDefined = (item: any): boolean => typeof item !== 'undefined';
      const isWildcard = (item: any): item is Wildcard =>
        item === CONDITIONAL_RESOLVER_WILDCARD;

      const isMatch = conditions.reduce<boolean>(
        (isPartialMatch, item, i) =>
          isPartialMatch &&
          isDefined(item) &&
          (isWildcard(item) || item === this.data[i]),
        true,
      );

      this.resolver = isMatch ? resolver : null;
    }
    return this;
  }

  /**
   * Set a default resolver if no conditions match
   * @param defaultResolver - Function to execute if no conditions match
   * @returns This instance for method chaining
   */
  default(defaultResolver: ResolverFunction<TResult>): this {
    this.defaultResolver = defaultResolver;
    return this;
  }

  /**
   * Resolve and return the result
   * @returns The result from the matching resolver, default resolver, or null
   */
  resolve(): TResult | null {
    // This resolves the output against current conditions.
    // Therefore, call for resolve() must be the last call in method chain.
    return this.resolver
      ? this.resolver()
      : this.defaultResolver
      ? this.defaultResolver()
      : null;
  }
}

// /**
//  * Convenience type alias for common state/role resolver
//  */
// export type StateRoleResolver<TResult> = ConditionalResolver<
//   [state: string, role: string],
//   TResult
// >;

