import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationArgs, SearchArgs } from '../common/dto';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { List } from '../lists/entities/list.entity';
import { ListItem } from './entities/list-item.entity';

@Injectable()
export class ListItemService {

	constructor(
		@InjectRepository( ListItem )
		private readonly listItemRepository: Repository<ListItem>,
	) { }

	async create( createListItemInput: CreateListItemInput ): Promise<ListItem> {

		const { itemId, listId, ...rest } = createListItemInput;

		const listItem = this.listItemRepository.create( {
			...rest,
			item: { id: itemId },
			list: { id: listId },
		} );

		await this.listItemRepository.save( listItem );

		return await this.findOne( listItem.id );

	}

	async findAll(
		list: List,
		paginationArgs: PaginationArgs,
		searchArgs: SearchArgs,
	): Promise<ListItem[]> {

		const { limit, offset } = paginationArgs;
		const { search } = searchArgs;

		const query = this.listItemRepository.createQueryBuilder()
			.where( '"listId" = :listId', { listId: list.id } )
			.skip( offset )
			.take( limit );

		if ( search ) {
			query.andWhere( 'LOWER(item.name) LIKE :search', { search: `%${ search }%` } );
		}

		return await query.getMany();

	}

	async findOne( id: string ): Promise<ListItem> {

		try {

			const listItem = await this.listItemRepository.findOneByOrFail( { id } );

			return listItem;

		} catch ( error ) {
			throw new NotFoundException( `${ id } not found` );
		}

	}

	async update( id: string, updateListItemInput: UpdateListItemInput ): Promise<ListItem> {

		const { itemId, listId, ...rest } = updateListItemInput;

		await this.findOne( id );

		const queryBuilder = this.listItemRepository.createQueryBuilder()
			.update()
			.set( rest )
			.where( '"id" = :id', { id } );

		if ( itemId ) queryBuilder.set( { item: { id: itemId } } );
		if ( listId ) queryBuilder.set( { list: { id: listId } } );

		await queryBuilder.execute();

		return await this.findOne( id );

	}

	remove( id: number ) {
		return `This action removes a #${ id } listItem`;
	}

	async listItemsCount( list: List ): Promise<number> {
		return await this.listItemRepository.count( {
			where: { list: { id: list.id } },
		} );
	}

}
