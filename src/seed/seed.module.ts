import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';

@Module( {
	providers: [ SeedResolver, SeedService ],
	imports: [
		ConfigModule,
		ItemsModule,
		UsersModule
	]
} )
export class SeedModule { }
