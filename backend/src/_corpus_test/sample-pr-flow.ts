import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetScheduleByDateUsecase } from './get-schedule-by-date.usecase';

@Resolver()
export class ScheduleByDateResolver {
  constructor(private readonly getScheduleByDate: GetScheduleByDateUsecase) {}

  @Query(() => String)
  async getScheduleByDate(@Args('date') date: string): Promise<string> {
    return this.getScheduleByDate.execute({ date });
  }
}
