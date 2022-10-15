import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

	private logger = new Logger( 'UsersService' );

	constructor(
		@InjectRepository( User )
		private readonly usersRepository: Repository<User>
	) { }

	async create( signupInput: SignupInput ): Promise<User> {

		const { password } = signupInput;

		try {

			const user = this.usersRepository.create( {
				...signupInput,
				password: bcrypt.hashSync( password, 10 )
			} );

			await this.usersRepository.save( user );

			return user;

		} catch ( error ) {
			this.handleDBErrors( error );
		}

	}

	async findAll( roles: ValidRoles[] ): Promise<User[]> {

		try {

			if ( roles.length === 0 ) {
				return await this.usersRepository.find();
			}

			return await this.usersRepository.createQueryBuilder()
				.andWhere( 'ARRAY[roles] && ARRAY[:...roles]', { roles } )
				.getMany();

		} catch ( error ) {
			this.handleDBErrors( error );
		}

	}

	async findOneByEmail( email: string ): Promise<User> {

		try {

			const user = await this.usersRepository.findOneByOrFail( { email } );
			return user;

		} catch ( error ) {
			throw new NotFoundException( `${ email } not found` );

			// this.handleDBErrors( {
			// 	code: 'error-01',
			// 	detail: `${ email } not found`
			// } );
		}

	}

	async findOneById( id: string ): Promise<User> {

		try {

			const user = await this.usersRepository.findOneByOrFail( { id } );
			return user;

		} catch ( error ) {
			throw new NotFoundException( `${ id } not found` );
		}

	}

	async update( id: string, updateUserInput: UpdateUserInput, updatedBy: User ): Promise<User> {

		const { password = '' } = updateUserInput;

		try {

			if ( password ) {
				updateUserInput.password = bcrypt.hashSync( password, 10 );
			}

			const user = await this.usersRepository.preload( updateUserInput );
			user.lastUpdateBy = updatedBy;

			await this.usersRepository.save( user );

			return user;

		} catch ( error ) {
			throw new NotFoundException( `${ id } not found` );
		}

	}

	async block( id: string, updatedBy: User ): Promise<User> {

		try {

			const user = await this.findOneById( id );

			user.isActive = false;
			user.lastUpdateBy = updatedBy;

			await this.usersRepository.save( user );

			return user;

		} catch ( error ) {

			this.handleDBErrors( error );

		}

	}

	private handleDBErrors( error: any ): never {

		if ( error.code === '23505' ) {
			throw new BadRequestException( error.detail.replace( 'Key ', '' ) );
		}

		if ( error.code === 'error-01' ) {
			throw new NotFoundException( error.detail );
		}

		this.logger.error( error );

		throw new InternalServerErrorException( 'Please, check server logs.' );

	}

}
