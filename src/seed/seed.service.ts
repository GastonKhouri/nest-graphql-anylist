import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';

import { SEED_USERS, SEED_ITEMS, SEED_LISTS } from './data/seed-data';
import { ItemsService } from '../items/items.service';
import { UsersService } from '../users/users.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {

	private isProd: boolean;

	constructor(
		configService: ConfigService,

		@InjectRepository( User )
		private readonly usersRepository: Repository<User>,

		@InjectRepository( Item )
		private readonly itemsRepository: Repository<Item>,

		@InjectRepository( ListItem )
		private readonly listItemsRepository: Repository<ListItem>,

		@InjectRepository( List )
		private readonly listsRepository: Repository<List>,

		private readonly usersService: UsersService,

		private readonly itemsService: ItemsService,

		private readonly listsService: ListsService,

		private readonly listItemService: ListItemService,
	) {
		this.isProd = configService.get( 'STATE' ) === 'prod';
	}

	async executeSeed(): Promise<boolean> {

		if ( this.isProd ) {
			throw new UnauthorizedException( 'Can not run seed in production' );
		}

		// Borrar base de datos
		await this.clearDatabase();

		// Cargar usuarios
		const user = await this.loadUsers();

		// Cargar items
		await this.loadItems( user );

		// Cargar listas
		const list = await this.loadLists( user );

		// Cargar listItems
		await this.loadListItems( user, list );

		return true;

	}

	async clearDatabase() {

		// Borrar listItems
		await this.listItemsRepository.createQueryBuilder()
			.delete()
			.where( {} )
			.execute();

		// Borrar lists
		await this.listsRepository.createQueryBuilder()
			.delete()
			.where( {} )
			.execute();

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

	async loadLists( user: User ): Promise<List> {

		const lists = SEED_LISTS.map( list => {
			return this.listsService.create( list, user );
		} );

		const [ list ] = await Promise.all( lists );

		return list;

	}

	async loadListItems( user: User, list: List ): Promise<void> {

		const items = await this.itemsService.findAll( user, { limit: 15, offset: 0 }, {} );

		const listsItems = items.map( item => {
			return this.listItemService.create( {
				quantity: Math.round( Math.random() * 10 ),
				completed: Math.round( Math.random() ) === 1,
				listId: list.id,
				itemId: item.id,
			} );
		} );

		await Promise.all( listsItems );

	}

}
