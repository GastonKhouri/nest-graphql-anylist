import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver } from '@nestjs/apollo';
import { JwtService } from '@nestjs/jwt';

import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module( {
	imports: [

		ConfigModule.forRoot(),

		GraphQLModule.forRootAsync( {
			driver: ApolloDriver,
			imports: [ AuthModule ],
			inject: [ JwtService ],
			useFactory: async ( jwtService: JwtService ) => ( {
				playground: false,
				autoSchemaFile: join( process.cwd(), 'src/schema.gql' ),
				plugins: [
					ApolloServerPluginLandingPageLocalDefault(),
				],
				context: ( { req } ) => {

					// const token = req.headers.authorization?.replace( 'Bearer ', '' ) || '';
					// if ( !token ) throw new Error( 'No token provided' );

					// const payload = jwtService.verify( token );
					// if ( !payload ) throw new Error( 'Invalid token' );

				},
			} ),
		} ),

		/** Configucacion basica */
		// GraphQLModule.forRoot<ApolloDriverConfig>( {
		// 	driver: ApolloDriver,
		// 	autoSchemaFile: join( process.cwd(), 'src/schema.gql' ),
		// 	playground: false,
		// 	plugins: [
		// 		ApolloServerPluginLandingPageLocalDefault
		// 	]
		// } ),

		TypeOrmModule.forRoot( {
			type: 'postgres',
			host: process.env.DB_HOST,
			port: +process.env.DB_PORT,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			synchronize: true,
			autoLoadEntities: true
		} ),

		ItemsModule,

		UsersModule,

		AuthModule,

	],
	controllers: [],
	providers: [],
} )
export class AppModule { }
