import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetScheduleSummaryUsecase } from './get-schedule-summary.usecase';

@Resolver()
export class ScheduleSummaryResolver {
  constructor(private readonly getScheduleSummary: GetScheduleSummaryUsecase) {}

  @Query(() => String)
  async getScheduleSummary(@Args('userID') userID: string): Promise<string> {
    console.log(`getScheduleSummary called for userID=${userID}`);
    return this.getScheduleSummary.execute({ userID });
  }
}
