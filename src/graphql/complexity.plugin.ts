import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { GraphQLError, OperationDefinitionNode } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { MAX_COMPLEXITY } from './complexity';

function isIntrospection(operation?: OperationDefinitionNode): boolean {
  return Boolean(
    operation?.selectionSet.selections.every(
      (selection) =>
        selection.kind === 'Field' && selection.name.value.startsWith('__'),
    ),
  );
}

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private readonly schemaHost: GraphQLSchemaHost) {}

  requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const { schema } = this.schemaHost;

    return Promise.resolve({
      didResolveOperation: ({ request, document, operation }) => {
        if (isIntrospection(operation)) {
          return Promise.resolve();
        }

        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > MAX_COMPLEXITY) {
          throw new GraphQLError(
            `Запрос слишком сложный: ${complexity} при максимуме ${MAX_COMPLEXITY}.`,
          );
        }

        return Promise.resolve();
      },
    });
  }
}
