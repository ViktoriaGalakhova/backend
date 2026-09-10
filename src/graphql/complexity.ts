import type { ComplexityEstimatorArgs } from 'graphql-query-complexity';

export const MAX_COMPLEXITY = 200;

export function pageComplexity(options: ComplexityEstimatorArgs): number {
  const pagination = options.args.pagination as { limit?: number } | undefined;
  return (pagination?.limit ?? 10) * options.childComplexity;
}
