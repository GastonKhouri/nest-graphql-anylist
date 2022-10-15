import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ValidRoles } from '../enums/valid-roles.enum';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator( ( roles: ValidRoles[] = [], context: ExecutionContext ) => {

	const ctx = GqlExecutionContext.create( context );
	const user: User = ctx.getContext().req.user;

	if ( !user ) {
		throw new InternalServerErrorException(
			'No user inside the request - make sure that you are using the AuthGuard decorator.'
		);
	}

	if ( roles.length === 0 ) return user;

	const hasRole = roles.some( role => user.roles.includes( role ) );

	if ( hasRole ) return user;

	throw new ForbiddenException(
		`User ${ user.fullname } need a valid role (${ roles.join( ', ' ) })`
	);

} );
