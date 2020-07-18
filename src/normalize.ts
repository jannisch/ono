import { format } from "./isomorphic.node";
import { ErrorLike, OnoOptions } from "./types";

/**
 * Normalizes Ono options, accounting for defaults and optional options.
 */
export function normalizeOptions(options?: OnoOptions): OnoOptions {
  options = options || {};
  return {
    concatMessages: options.concatMessages === undefined ? true : Boolean(options.concatMessages),
    format: options.format === undefined ? format
      : (typeof options.format === "function" ? options.format : false),
  };
}

/**
 * Normalizes the Ono arguments, accounting for defaults, options, and optional arguments.
 */
export function normalizeArgs<TError extends ErrorLike, TProps extends object>(args: unknown[], options: OnoOptions) {
  let originalError: TError | undefined;
  let props: TProps | undefined;
  let formatArgs: unknown[];
  let message = "";

  // Determine which arguments were actually specified
  if (typeof args[0] === "string") {
    formatArgs = args;
  }
  else if (typeof args[1] === "string") {
    if (args[0] instanceof Error) {
      originalError = args[0] as TError;
    }
    else {
      props = args[0] as TProps;
    }
    formatArgs = args.slice(1);
  }
  else {
    originalError = args[0] as TError;
    props = args[1] as TProps;
    formatArgs = args.slice(2);
  }

  // If there are any format arguments, then format the error message
  if (formatArgs.length > 0) {
    if (options.format) {
      message = options.format.apply(undefined, formatArgs);
    }
    else {
      message = formatArgs.join(" ");
    }
  }

  if (options.concatMessages && originalError && originalError.message) {
    // The inner-error's message will be added to the new message
    message += (message ? " \n" : "") + originalError.message;
  }

  return { originalError, props, message };
}
