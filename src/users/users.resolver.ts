import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';

import { UsersService } from './users.service';
import { ItemsService } from '../items/items.service';

import { User } from './entities/user.entity';
import { Item } from '../items/entities/item.entity';

import { SearchArgs, PaginationArgs } from '../common/dto';
import { ValidRolesArgs, UpdateUserInput } from './dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { ValidRoles } from '../auth/enums/valid-roles.enum';

@Resolver( () => User )
@UseGuards( JwtAuthGuard )
export class UsersResolver {

	constructor(
		private readonly usersService: UsersService,
		private readonly itemsService: ItemsService,
	) { }

	@Query( () => [ User ], { name: 'users' } )
	findAll(
		@Args() validRoles: ValidRolesArgs,
		@CurrentUser( [ ValidRoles.superUser, ValidRoles.admin ] ) user: User,
		@Args() paginationArgs: PaginationArgs,
		@Args() searchArgs: SearchArgs,
	): Promise<User[]> {
		return this.usersService.findAll( validRoles.roles, paginationArgs, searchArgs );
	}

	@Query( () => User, { name: 'user' } )
	findOne(
		@Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
		@CurrentUser( [ ValidRoles.superUser, ValidRoles.admin ] ) user: User
	): Promise<User> {
		return this.usersService.findOneById( id );
	}

	@Mutation( () => User, { name: 'updateUser' } )
	update(
		@Args( 'updateUserInput' ) updateUserInput: UpdateUserInput,
		@CurrentUser( [ ValidRoles.admin ] ) user: User
	): Promise<User> {
		return this.usersService.update( updateUserInput.id, updateUserInput, user );
	}

	@Mutation( () => User, { name: 'blockUser' } )
	blockUser(
		@Args( 'id', { type: () => ID }, ParseUUIDPipe ) id: string,
		@CurrentUser( [ ValidRoles.admin ] ) user: User
	): Promise<User> {
		return this.usersService.block( id, user );
	}

	@ResolveField( () => Int, { name: 'itemCount' } )
	async itemCount(
		@CurrentUser( [ ValidRoles.admin ] ) adminUser: User,
		@Parent() user: User,
	): Promise<number> {
		return this.itemsService.itemCountByUser( user );
	}

	@ResolveField( () => [ Item ], { name: 'items' } )
	async getItemsByUser(
		@CurrentUser( [ ValidRoles.admin ] ) adminUser: User,
		@Parent() user: User,
		@Args() paginationArgs: PaginationArgs,
		@Args() searchArgs: SearchArgs,
	): Promise<Item[]> {
		return this.itemsService.findAll( user, paginationArgs, searchArgs );
	}

}
