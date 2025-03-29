import { Container, type DynamicValueBuilder } from 'inversify';

export interface FactoryLike<T> {
  create(): T;
}

export class DependencyInjectionContainer {
  private instance: Container;

  public constructor() {
    this.instance = new Container({
      defaultScope: 'Singleton',
    });
  }

  public bindToValue<T>(symbol: symbol, value: T): void {
    this.instance.bind(symbol).toConstantValue(value);
  }

  public bind<T>(symbol: symbol, dynamicValueBuilder: DynamicValueBuilder<T>): void {
    this.instance.bind(symbol).toDynamicValue(dynamicValueBuilder);
  }

  public async overrideBinding<T>(symbol: symbol, dynamicValueBuilder: DynamicValueBuilder<T>): Promise<void> {
    await this.instance.unbind(symbol);

    this.instance.bind(symbol).toDynamicValue(dynamicValueBuilder);
  }

  public get<T>(symbol: symbol): T {
    return this.instance.get(symbol);
  }
}
