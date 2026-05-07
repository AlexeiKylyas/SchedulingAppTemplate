import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AppointmentRepository } from '../infrastructure/appointment.repository';
import { UserRepository } from '../../identity/infrastructure/user.repository';
import { NotificationService } from '../../notifications/notification.service';

@Resolver()
export class AppointmentResolver {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  @Mutation(() => String)
  async bookAppointment(
    @Args('userId') userID: string,
    @Args('slotId') slotID: string,
    @Args('serviceId') serviceID: string,
    @Args('note') note: string,
  ) {
    // Business logic directly in resolver
    const user = await this.userRepository.findByID(userID);
    if (!user) return null;
    const appointment = await this.appointmentRepository.create(userID, slotID, serviceID, note);
    await this.notificationService.sendConfirmation(user.email, appointment.id);
    return appointment.id;
  }
}
