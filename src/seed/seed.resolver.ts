import { Resolver, Mutation } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {

	constructor(
		private readonly seedService: SeedService
	) { }

	@Mutation( () => Boolean, { name: 'executeSeed', description: 'Construir base de datos' } )
	executeSeed() {
		return this.seedService.executeSeed();
	}

}
