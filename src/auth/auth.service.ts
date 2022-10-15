import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) { }

	private getJwtToken( userId: string ): string {
		return this.jwtService.sign( { id: userId } );
	}

	async signup( signupInput: SignupInput ): Promise<AuthResponse> {

		const user = await this.usersService.create( signupInput );

		const token = this.getJwtToken( user.id );

		return {
			user,
			token
		};

	}

	async login( loginInput: LoginInput ): Promise<AuthResponse> {

		const { email, password } = loginInput;

		const user = await this.usersService.findOneByEmail( email );

		const isValidPassword = bcrypt.compareSync( password, user.password );

		if ( !isValidPassword ) {
			throw new BadRequestException( 'Invalid credentials' );
		}

		const token = this.getJwtToken( user.id );

		return {
			user,
			token
		};

	}

	revalidate( user: User ): AuthResponse {

		const token = this.getJwtToken( user.id );

		return {
			user,
			token
		};

	}

	async validateUser( id: string ): Promise<User> {

		const user = await this.usersService.findOneById( id );

		if ( !user.isActive ) {
			throw new UnauthorizedException( 'User is not active, talk to the administrator.' );
		}

		delete user.password;

		return user;

	}

}
