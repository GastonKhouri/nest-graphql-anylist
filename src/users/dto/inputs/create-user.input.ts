import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {

	@Field( () => String )
	@IsNotEmpty()
	@Transform( ( { value } ) => value.trim() )
	fullname: string;

	@Field( () => String )
	@IsEmail()
	@Transform( ( { value } ) => value.trim() )
	email: string;

	@Field( () => String )
	@MinLength( 6 )
	password: string;

}
