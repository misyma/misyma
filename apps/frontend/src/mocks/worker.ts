import { setupWorker } from 'msw/browser';
import todoHandlers from './requests/todosApi';

export const worker = setupWorker(...todoHandlers);
