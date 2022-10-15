import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateItemInput, CreateItemInput } from './dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {

	constructor(
		@InjectRepository( Item )
		private readonly itemsRepository: Repository<Item>,
	) { }

	async create( createItemInput: CreateItemInput ): Promise<Item> {

		const newItem = this.itemsRepository.create( createItemInput );

		await this.itemsRepository.save( newItem );

		return newItem;

	};

	async findAll(): Promise<Item[]> {

		const items = await this.itemsRepository.find();

		return items;

	}

	async findOne( id: string ): Promise<Item> {

		const item = await this.itemsRepository.findOneBy( { id } );

		if ( !item ) throw new NotFoundException( `Item #${ id } not found` );

		return item;

	}

	async update( id: string, updateItemInput: UpdateItemInput ): Promise<Item> {

		const updatedItem = await this.itemsRepository.preload( updateItemInput );

		if ( !updatedItem ) throw new NotFoundException( `Item #${ id } not found` );

		await this.itemsRepository.save( updatedItem );

		return updatedItem;

	}

	async remove( id: string ): Promise<Item> {

		const item = await this.findOne( id );

		this.itemsRepository.remove( item );

		return item;

	}
}
