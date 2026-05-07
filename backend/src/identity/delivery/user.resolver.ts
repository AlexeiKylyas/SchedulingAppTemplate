import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FindUserUsecase } from '../application/find-user.usecase';
import { UpdateUserProfileUsecase } from '../application/update-user-profile.usecase';

@Resolver()
export class UserResolver {
  constructor(
    private readonly findUser: FindUserUsecase,
    private readonly updateUserProfile: UpdateUserProfileUsecase,
  ) {}

  @Query(() => String)
  async getUser(@Args('id') userID: string) {
    return this.findUser.execute(userID);
  }

  @Mutation(() => String)
  async updateUser(
    @Args('id') userID: string,
    @Args('name') name: string,
    @Args('email') email: string,
  ) {
    return this.updateUserProfile.execute({ userID, name, email });
  }
}
