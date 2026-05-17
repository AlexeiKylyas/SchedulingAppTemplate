import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetSampleUsecase } from './get-sample.usecase';

@Resolver()
export class SampleResolver {
  constructor(private readonly getSample: GetSampleUsecase) {}

  @Query(() => String)
  async getSample(@Args('id') id: string): Promise<string> {
    return this.getSample.execute({ id });
  }
}
