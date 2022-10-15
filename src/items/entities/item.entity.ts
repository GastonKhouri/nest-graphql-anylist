import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity( { name: 'items' } )
@ObjectType()
export class Item {

	@PrimaryGeneratedColumn( 'uuid' )
	@Field( () => ID )
	id: string;

	@Column()
	@Field( () => String )
	name: string;

	@Column( { nullable: true } )
	@Field( () => String, { nullable: true } )
	quantityUnits?: string;

	@ManyToOne( () => User, user => user.items, { nullable: false, lazy: true } )
	@Index( 'IDX_ITEM_USER' )
	@Field( () => User )
	user: User;

}
