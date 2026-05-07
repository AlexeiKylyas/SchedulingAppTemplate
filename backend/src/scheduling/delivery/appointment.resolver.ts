import { Resolver, Mutation, Args, InputType, Field } from '@nestjs/graphql';
import { BookAppointmentUsecase } from '../application/book-appointment.usecase';

@InputType()
export class BookAppointmentInput {
  @Field() userID: string;
  @Field() slotID: string;
  @Field() serviceID: string;
  @Field({ nullable: true }) note?: string;
}

@Resolver()
export class AppointmentResolver {
  constructor(private readonly bookAppointment: BookAppointmentUsecase) {}

  @Mutation(() => String)
  async bookAppointment(@Args('input') input: BookAppointmentInput) {
    return this.bookAppointment.execute(input);
  }
}
