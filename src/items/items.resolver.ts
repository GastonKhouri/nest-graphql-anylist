import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { UpdateItemInput, CreateItemInput } from './dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver( () => Item )
@UseGuards( JwtAuthGuard )
export class ItemsResolver {
	constructor( private readonly itemsService: ItemsService ) { }

	@Mutation( () => Item, { name: 'createItem' } )
	createItem(
		@Args( 'createItemInput' ) createItemInput: CreateItemInput,
		@CurrentUser() user: User
	): Promise<Item> {
		return this.itemsService.create( createItemInput, user );
	}

	@Query( () => [ Item ], { name: 'items' } )
	findAll(
		@CurrentUser() user: User
	): Promise<Item[]> {
		return this.itemsService.findAll( user );
	}

	@Query( () => Item, { name: 'item' } )
	findOne(
		@Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
		@CurrentUser() user: User
	): Promise<Item> {
		return this.itemsService.findOne( id, user );
	}

	@Mutation( () => Item )
	updateItem(
		@Args( 'updateItemInput' ) updateItemInput: UpdateItemInput,
		@CurrentUser() user: User
	): Promise<Item> {
		return this.itemsService.update( updateItemInput.id, updateItemInput, user );
	}

	@Mutation( () => Item )
	removeItem(
		@Args( 'id', { type: () => ID } ) id: string,
		@CurrentUser() user: User
	): Promise<Item> {
		return this.itemsService.remove( id, user );
	}
}
