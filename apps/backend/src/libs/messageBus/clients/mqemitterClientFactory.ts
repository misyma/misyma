import mqemitter, { type MQEmitterOptions } from 'mqemitter';

import { type MQemitterClient } from './mqemitterClient.js';

export class MQEmitterClientFactory {
  public create(options: MQEmitterOptions): MQemitterClient {
    const mqEmitterConstructor = mqemitter.default || mqemitter;

    return mqEmitterConstructor(options);
  }
}
