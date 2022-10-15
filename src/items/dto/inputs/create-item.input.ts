import { InputType, Field, Float } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

@InputType()
export class CreateItemInput {

	@Field( () => String )
	@IsString()
	@IsNotEmpty()
	@Transform( ( { value } ) => value.trim() )
	name: string;

	@Field( () => String, { nullable: true } )
	@IsString()
	@IsOptional()
	quantityUnits?: string;

}
