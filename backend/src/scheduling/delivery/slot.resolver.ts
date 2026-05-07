import { Resolver, Query, Args } from '@nestjs/graphql';
import { SlotRepository } from '../infrastructure/slot.repository';

@Resolver()
export class SlotResolver {
  constructor(private readonly slotRepository: SlotRepository) {}

  @Query(() => [String])
  async availableSlots(
    @Args('serviceId') serviceID: string,
    @Args('date') date: string,
    @Args('staffId') staffID: string,
  ) {
    // Direct DB access in resolver — no validation on external inputs
    const slots = await this.slotRepository.findAvailable(serviceID, date, staffID);
    return slots.map(s => s.id);
  }
}
