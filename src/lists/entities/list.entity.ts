import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { User } from '../../users/entities/user.entity';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity( { name: 'lists' } )
@ObjectType()
export class List {

	@PrimaryGeneratedColumn( 'uuid' )
	@Field( () => String )
	id: string;

	@Column()
	@Field( () => String )
	@IsString()
	@IsNotEmpty()
	@Transform( ( { value } ) => value.trim() )
	name: string;

	@ManyToOne( () => User, user => user.id, { nullable: false, lazy: true } )
	@Index( 'IDX_LIST_USER' )
	@Field( () => User )
	user: User;

	@OneToMany( () => ListItem, listItem => listItem.list, { lazy: true } )
	// @Field( () => [ ListItem ] )
	listItem: ListItem[];

}
