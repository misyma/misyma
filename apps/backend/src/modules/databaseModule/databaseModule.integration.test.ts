import { beforeEach, expect, describe, it } from 'vitest';

import { TestContainer } from '../../../tests/testContainer.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';

import { DatabaseManager } from './infrastructure/databaseManager.js';
import { databaseSymbols } from './symbols.js';

describe('DatabaseModule', () => {
  let container: DependencyInjectionContainer;

  beforeEach(async () => {
    container = await TestContainer.create();
  });

  it('declares bindings', async () => {
    expect(container.get(databaseSymbols.databaseManager)).toBeInstanceOf(DatabaseManager);
  });
});
