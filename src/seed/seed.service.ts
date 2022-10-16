import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {

	private isProd: boolean;

	constructor(
		private readonly configService: ConfigService,

		@InjectRepository( User )
		private readonly usersRepository: Repository<User>,

		@InjectRepository( Item )
		private readonly itemsRepository: Repository<Item>,

		private readonly usersService: UsersService,

		private readonly itemsService: ItemsService,
	) {
		this.isProd = configService.get( 'STATE' ) === 'prod';
	}

	async executeSeed(): Promise<boolean> {

		if ( this.isProd ) {
			throw new UnauthorizedException( 'Can not run seed in production' );
		}

		await this.clearDatabase();

		const user = await this.loadUsers();

		await this.loadItems( user );

		return true;

	}

	async clearDatabase() {

		// Borrar items
		await this.itemsRepository.createQueryBuilder()
			.delete()
			.where( {} )
			.execute();

		// Borrar usuarios
		await this.usersRepository.createQueryBuilder()
			.delete()
			.where( {} )
			.execute();

	}

	async loadUsers(): Promise<User> {

		const users = SEED_USERS.map( user => {
			return this.usersService.create( user );
		} );

		const [ user ] = await Promise.all( users );

		return user;

	}

	async loadItems( user: User ): Promise<void> {

		const items = SEED_ITEMS.map( item => {
			return this.itemsService.create( item, user );
		} );

		await Promise.all( items );

	}

}
