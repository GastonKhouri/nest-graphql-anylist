import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Item } from '../../items/entities/item.entity';
import { List } from '../../lists/entities/list.entity';

@Entity( { name: 'users' } )
@ObjectType()
export class User {

	@PrimaryGeneratedColumn( 'uuid' )
	@Field( () => ID )
	id: string;

	@Column()
	@Field( () => String )
	@Transform( ( { value } ) => value.trim() )
	fullname: string;

	@Column( { unique: true } )
	@Field( () => String )
	@Transform( ( { value } ) => value.trim() )
	email: string;

	@Column()
	// @Field( () => String )
	password: string;

	@Column( { type: 'text', array: true, default: [ 'user' ] } )
	@Field( () => [ String ] )
	roles: string[];

	@Column( { type: 'boolean', default: true } )
	@Field( () => Boolean )
	isActive: boolean;

	@ManyToOne( () => User, user => user.lastUpdateBy, { nullable: true, lazy: true } )
	@JoinColumn( { name: 'lastUpdateBy' } )
	@Field( () => User, { nullable: true } )
	lastUpdateBy?: User;

	@OneToMany( () => Item, item => item.user, { lazy: true } )
	// @Field( () => [ Item ] )
	items: Item[];

	@OneToMany( () => List, list => list.user, { lazy: true } )
	@Field( () => [ List ] )
	lists: List[];

}
