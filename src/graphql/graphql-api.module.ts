import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { CatalogModule } from '../catalog/catalog.module';
import { LocationsModule } from '../locations/locations.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { UsersModule } from '../users/users.module';
import { ComplexityPlugin } from './complexity.plugin';
import { CafeLocationsResolver } from './resolvers/cafe-locations.resolver';
import { CategoriesResolver } from './resolvers/categories.resolver';
import { ProductsResolver } from './resolvers/products.resolver';
import { ReviewsResolver } from './resolvers/reviews.resolver';
import { UsersResolver } from './resolvers/users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
    UsersModule,
    ReviewsModule,
    CatalogModule,
    LocationsModule,
  ],
  providers: [
    ComplexityPlugin,
    UsersResolver,
    ReviewsResolver,
    CategoriesResolver,
    ProductsResolver,
    CafeLocationsResolver,
  ],
})
export class GraphqlApiModule {}
