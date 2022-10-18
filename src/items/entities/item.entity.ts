import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity( { name: 'items' } )
@ObjectType()
export class Item {

	@PrimaryGeneratedColumn( 'uuid' )
	@Field( () => ID )
	id: string;

	@Column()
	@Field( () => String )
	@IsString()
	@Transform( ( { value } ) => value.trim() )
	name: string;

	@Column( { nullable: true } )
	@Field( () => String, { nullable: true } )
	@Transform( ( { value } ) => value.trim() )
	quantityUnits?: string;

	@ManyToOne( () => User, user => user.items, { nullable: false, lazy: true } )
	@Index( 'IDX_ITEM_USER' )
	@Field( () => User )
	user: User;

	@OneToMany( () => ListItem, listItem => listItem.item, { lazy: true } )
	@Field( () => [ ListItem ] )
	listItem: ListItem[];

}
