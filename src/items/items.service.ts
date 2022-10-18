import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';

import { UpdateItemInput, CreateItemInput } from './dto';
import { PaginationArgs, SearchArgs } from '../common/dto';

@Injectable()
export class ItemsService {

	constructor(
		@InjectRepository( Item )
		private readonly itemsRepository: Repository<Item>,
	) { }

	async create( createItemInput: CreateItemInput, user: User ): Promise<Item> {

		const newItem = this.itemsRepository.create( { ...createItemInput, user } );

		await this.itemsRepository.save( newItem );

		return newItem;

	};

	async findAll(
		user: User,
		paginationArgs: PaginationArgs,
		searchArgs: SearchArgs
	): Promise<Item[]> {

		const { limit, offset } = paginationArgs;
		const { search } = searchArgs;

		// const items = await this.itemsRepository.find( {
		// 	where: {
		// 		user: { id: user.id },
		// 		name: Like( `%${ search }%` )
		// 	},
		// 	take: limit,
		// 	skip: offset,
		// } );

		const queryBuilder = this.itemsRepository.createQueryBuilder()
			.where( '"userId" = :userId', { userId: user.id } )
			.take( limit )
			.skip( offset );

		if ( search ) {
			queryBuilder.andWhere(
				'LOWER(name) LIKE :search', { search: `%${ search.toLowerCase() }%` }
			);
		}

		return await queryBuilder.getMany();

	}

	async findOne( id: string, user: User ): Promise<Item> {

		try {

			const item = await this.itemsRepository.findOneByOrFail( {
				id,
				user: { id: user.id }
			} );

			return item;

		} catch ( error ) {
			throw new NotFoundException( `${ id } not found` );
		}

	}

	async update( id: string, updateItemInput: UpdateItemInput, user: User ): Promise<Item> {

		await this.findOne( id, user );

		const updatedItem = await this.itemsRepository.preload( updateItemInput );

		await this.itemsRepository.save( updatedItem );

		return updatedItem;

	}

	async remove( id: string, user: User ): Promise<Item> {

		const item = await this.findOne( id, user );

		await this.itemsRepository.remove( item );

		return { ...item, user };

	}

	async itemCountByUser( user: User ): Promise<number> {

		return await this.itemsRepository.count( {
			where: {
				user: { id: user.id }
			}
		} );

	}

}
