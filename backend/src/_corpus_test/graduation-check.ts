// This file intentionally violates two team review patterns from
// .github/claude-review-corpus.jsonl to verify the corpus-aware bot
// reviewer cites them during graduation validation.
//
// NOT a production file. Lives outside the TS build path.
// Will be removed after PR close.

interface CorpusTestUser {
  id: string;
  email: string;
}

export class GraduationCheckNotificationService {
  // Always-on pattern 1: silent fallback via `??`
  // Expected bot citation: "silent-fallback" / "fail-loud"
  private getChannel(): string {
    return process.env.NOTIFICATION_CHANNEL ?? 'main';
  }

  // Always-on pattern 5: 4 positional args (must be object args)
  // Expected bot citation: "3+ positional args" / "object-args"
  async send(
    user: CorpusTestUser,
    channel: string,
    retryCount: number,
    force: boolean,
  ) {
    const resolvedChannel = this.getChannel();
    return {
      user: user.id,
      requestedChannel: channel,
      resolvedChannel,
      retryCount,
      force,
    };
  }
}
