import { type QueryBuilder } from './queryBuilder.js';
import { type QueryBuilderConfig } from './queryBuilderConfig.js';

export interface QueryBuilderFactory {
  create(config: QueryBuilderConfig): QueryBuilder;
}
