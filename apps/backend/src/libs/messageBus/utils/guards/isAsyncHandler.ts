import { type AsyncMessageHandler } from '../../bus/messageBus.js';

//eslint-disable-next-line @typescript-eslint/ban-types
export function isAsyncHandler(handler: Function): handler is AsyncMessageHandler {
  return handler.constructor.prototype[Symbol.toStringTag] === 'AsyncFunction';
}
