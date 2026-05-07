import { Resolver, Query, Args } from '@nestjs/graphql';
import { ScheduleRepository } from '../../scheduling/infrastructure/schedule.repository';
import { UserRepository } from '../infrastructure/user.repository';

@Resolver()
export class ScheduleResolver {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Query(() => String)
  async getUserSchedule(@Args('userId') userID: string) {
    // Direct DB access in resolver bypasses use cases
    const user = await this.userRepository.findByID(userID);
    if (!user) return null;
    const schedules = await this.scheduleRepository.findByUserID(userID);
    return schedules;
  }
}
