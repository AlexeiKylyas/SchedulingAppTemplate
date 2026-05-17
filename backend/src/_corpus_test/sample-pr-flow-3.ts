import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetAvailabilityUsecase } from './get-availability.usecase';

@Resolver()
export class AvailabilityResolver {
  constructor(private readonly getAvailability: GetAvailabilityUsecase) {}

  @Query(() => String)
  async getAvailability(
    @Args('providerID') providerID: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('slotDuration') slotDuration: number,
  ): Promise<string> {
    return this.getAvailability.execute({ providerID, startDate, endDate, slotDuration });
  }
}
