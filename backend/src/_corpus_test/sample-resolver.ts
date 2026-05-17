import { Resolver, Query, Args } from '@nestjs/graphql';
import { SampleRepository } from './sample.repository';

@Resolver()
export class SampleResolver {
  constructor(private readonly sampleRepo: SampleRepository) {}

  // ANTI-PATTERN: resolver calls repository directly (violates use-case layer)
  @Query(() => String)
  async getSample(@Args('id') id: string): Promise<string> {
    const item = await this.sampleRepo.findById(id);
    return item?.name ?? 'not found';
  }
}
