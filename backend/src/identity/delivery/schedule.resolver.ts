import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetUserScheduleUsecase } from '../../scheduling/application/get-user-schedule.usecase';

@Resolver()
export class ScheduleResolver {
  constructor(private readonly getUserSchedule: GetUserScheduleUsecase) {}

  @Query(() => String)
  async getUserSchedule(@Args('userId') userID: string) {
    return this.getUserSchedule.execute(userID);
  }
}
