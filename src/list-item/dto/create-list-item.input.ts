import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsNumber, Min, IsOptional, IsBoolean, IsUUID } from 'class-validator';

@InputType()
export class CreateListItemInput {

	@Field( () => Number, { nullable: true } )
	@IsNumber()
	@Min( 0 )
	@IsOptional()
	quantity: number = 0;

	@Field( () => Boolean, { nullable: true } )
	@IsBoolean()
	@IsOptional()
	completed: boolean = false;

	@Field( () => ID )
	@IsUUID()
	listId: string;

	@Field( () => ID )
	@IsUUID()
	itemId: string;

}
