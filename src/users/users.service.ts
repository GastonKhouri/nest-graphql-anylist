import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UpdateUserInput } from './dto';
import { PaginationArgs, SearchArgs } from '../common/dto';

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

	async findAll(
		roles: ValidRoles[],
		paginationArgs: PaginationArgs,
		searchArgs: SearchArgs
	): Promise<User[]> {

		const { limit, offset } = paginationArgs;
		const { search } = searchArgs;

		const queryBuilder = this.usersRepository.createQueryBuilder()
			.take( limit )
			.skip( offset );

		if ( search ) {
			queryBuilder
				.orWhere(
					'LOWER(fullname) LIKE :search', { search: `%${ search.toLowerCase() }%` }
				)
				.orWhere(
					'LOWER(email) LIKE :search', { search: `%${ search.toLowerCase() }%` }
				);
		}

		try {

			if ( roles.length === 0 ) {
				return await queryBuilder.getMany();
			}

			return await queryBuilder
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
			throw new NotFoundException( `User ${ id } not found` );
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
