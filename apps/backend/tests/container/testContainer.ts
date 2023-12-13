import { Application } from '../../src/core/application.js';
import { type DependencyInjectionContainer } from '../../src/libs/dependencyInjection/dependencyInjectionContainer.js';

export class TestContainer {
  public static create(): DependencyInjectionContainer {
    const container = Application.createContainer();

    return container;
  }
}
