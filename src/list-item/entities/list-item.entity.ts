import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';

@Entity( 'listItems' )
@Unique( 'list-item', [ 'list', 'item' ] )
@ObjectType()
export class ListItem {

	@PrimaryGeneratedColumn( 'uuid' )
	@Field( () => ID )
	@IsUUID()
	id: string;

	@Column( { type: 'numeric' } )
	@Field( () => Number )
	quantity: number;

	@Column( { type: 'bool' } )
	@Field( () => Boolean )
	completed: boolean;

	@ManyToOne( () => List, list => list.listItem, { lazy: true } )
	@Field( () => List )
	list: List;

	@ManyToOne( () => Item, item => item.listItem, { lazy: true } )
	@Field( () => Item )
	item: Item;

}
