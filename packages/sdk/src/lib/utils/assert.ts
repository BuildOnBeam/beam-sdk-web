/**
 * Asserts that the given condition is true, throwing an error if not.
 * @param condition
 * @param message
 * @returns
 */
export function assert(
  condition: any,
  // Can provide a string, or a function that returns a string for cases where
  // the message takes a fair amount of effort to compute
  message: string | (() => string) = 'Assertion failed',
): asserts condition {
  if (condition) {
    return;
  }

  throw new Error(typeof message === 'function' ? message() : message);
}
