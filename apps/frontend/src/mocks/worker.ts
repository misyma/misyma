import { setupWorker } from 'msw/browser';
import { getTodosRequest } from './requests/getTodosRequest';

export const worker = setupWorker(getTodosRequest);
