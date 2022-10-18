import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { List } from './entities/list.entity';

import { PaginationArgs, SearchArgs } from '../common/dto';
import { CreateListInput, UpdateListInput } from './dto';

@Injectable()
export class ListsService {

	constructor(
		@InjectRepository( List )
		private readonly listsRepository: Repository<List>,
	) { }

	async create(
		createListInput: CreateListInput,
		user: User,
	): Promise<List> {

		const newList = this.listsRepository.create( { ...createListInput, user } );

		await this.listsRepository.save( newList );

		return newList;

	}

	async findAll(
		user: User,
		paginationArgs: PaginationArgs,
		searchArgs: SearchArgs
	): Promise<List[]> {

		const { limit, offset } = paginationArgs;
		const { search } = searchArgs;

		const queryBuilder = this.listsRepository.createQueryBuilder()
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

	async findOne( id: string, user: User ): Promise<List> {

		try {

			const list = await this.listsRepository.findOneByOrFail( {
				id,
				user: { id: user.id },
			} );

			return list;

		} catch ( error ) {
			throw new NotFoundException( `${ id } not found` );
		}

	}

	async update( id: string, updateListInput: UpdateListInput, user: User ): Promise<List> {

		await this.findOne( id, user );

		const updatedList = await this.listsRepository.preload( updateListInput );

		await this.listsRepository.save( updatedList );

		return updatedList;

	}

	async remove( id: string, user: User ): Promise<List> {

		const list = await this.findOne( id, user );

		await this.listsRepository.remove( list );

		return { ...list, user };

	}

	async listCountByUser( user: User ): Promise<number> {

		return await this.listsRepository.count( {
			where: {
				user: { id: user.id }
			}
		} );

	}

}
