import { Resolver, Query } from '@nestjs/graphql';
import { ExternalCalendarService } from './external-calendar.service';

@Resolver()
export class CalendarSyncResolver {
  constructor(private readonly calendarService: ExternalCalendarService) {}

  @Query(() => String)
  async syncCalendar(): Promise<string> {
    const apiKey = process.env.CALENDAR_API_KEY;
    return this.calendarService.sync({ apiKey });
  }
}
