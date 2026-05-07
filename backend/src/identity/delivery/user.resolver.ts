import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserRepository } from '../infrastructure/user.repository';

@Resolver()
export class UserResolver {
  constructor(private readonly userRepository: UserRepository) {}

  @Query(() => String)
  async getUser(@Args('id') userID: string) {
    // Direct DB access in resolver — bypasses use case layer
    const user = await this.userRepository.findByID(userID);
    if (!user) return null;
    return user;
  }

  @Mutation(() => String)
  async updateUser(
    @Args('id') userID: string,
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    // Business logic in resolver — should delegate to use case
    const user = await this.userRepository.findByID(userID);
    if (!user) return null;
    const updated = user.withName(name).withEmail(email);
    return this.userRepository.save(updated);
  }
}
