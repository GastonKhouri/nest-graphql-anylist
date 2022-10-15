import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/current-user.decorator';
import { LoginInput, SignupInput } from './dto/inputs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponse } from './types/auth-response.type';
import { User } from '../users/entities/user.entity';

@Resolver( () => AuthResponse )
export class AuthResolver {

	constructor(
		private readonly authService: AuthService
	) { }

	@Mutation( () => AuthResponse, { name: 'signup' } )
	signup(
		@Args( 'signupInput' ) signupInput: SignupInput
	): Promise<AuthResponse> {
		return this.authService.signup( signupInput );
	}

	@Mutation( () => AuthResponse, { name: 'login' } )
	login(
		@Args( 'loginInput' ) loginInput: LoginInput
	): Promise<AuthResponse> {
		return this.authService.login( loginInput );
	}

	@Query( () => AuthResponse, { name: 'revalidate' } )
	@UseGuards( JwtAuthGuard )
	revalidate(
		@CurrentUser( /* [ ValidRoles.admin ] */ ) user: User
	): AuthResponse {
		return this.authService.revalidate( user );
	}

}
