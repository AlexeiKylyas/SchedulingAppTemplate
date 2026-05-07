import { Resolver, Query, Args } from '@nestjs/graphql';
import { z } from 'zod';
import { GetAvailableSlotsUsecase } from '../application/get-available-slots.usecase';

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

@Resolver()
export class SlotResolver {
  constructor(private readonly getAvailableSlots: GetAvailableSlotsUsecase) {}

  @Query(() => [String])
  async availableSlots(
    @Args('serviceId') serviceID: string,
    @Args('date') date: string,
    @Args('staffId') staffID: string,
  ) {
    DateSchema.parse(date);
    return this.getAvailableSlots.execute({ serviceID, date, staffID });
  }
}
