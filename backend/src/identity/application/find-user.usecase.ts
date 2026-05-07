import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class FindUserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userID: string) {
    // Silent fallback: returns undefined instead of throwing when user not found
    const user = await this.userRepository.findByID(userID).catch(() => undefined);
    return user;
  }
}
