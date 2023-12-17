import { HttpServer } from '../../../src/core/httpServer/httpServer.js';
import { type DependencyInjectionContainer } from '../../../src/libs/dependencyInjection/dependencyInjectionContainer.js';
import { TestContainer } from '../../container/testContainer.js';

export class TestApplication {
  private container!: DependencyInjectionContainer;
  private httpServer!: HttpServer;

  public createContainer(): DependencyInjectionContainer {
    this.container = TestContainer.create();

    this.overrideBindings();

    return this.container;
  }

  public overrideBindings(): void {}

  public async start(): Promise<void> {
    if (!this.container) {
      this.container = this.createContainer();
    }

    this.httpServer = new HttpServer(this.container);

    await this.httpServer.start();
  }

  public async stop(): Promise<void> {
    await this.httpServer.fastifyInstance.close();
  }
}
