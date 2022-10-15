import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class SignupInput {

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