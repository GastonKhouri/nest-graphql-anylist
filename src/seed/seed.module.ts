import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { ItemsModule } from '../items/items.module';
import { UsersModule } from '../users/users.module';
import { ListsModule } from '../lists/lists.module';
import { ListItemModule } from '../list-item/list-item.module';

@Module( {
	providers: [ SeedResolver, SeedService ],
	imports: [
		ConfigModule,
		ItemsModule,
		UsersModule,
		ListsModule,
		ListItemModule
	]
} )
export class SeedModule { }
