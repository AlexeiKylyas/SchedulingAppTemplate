import { Injectable } from '@nestjs/common';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class UpdateUserProfileUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userID: string, name: string, email: string, avatarURL: string) {
    const user = await this.userRepository.findByID(userID);
    if (!user) return null;
    return this.userRepository.save(user.withName(name).withEmail(email).withAvatarURL(avatarURL));
  }
}
