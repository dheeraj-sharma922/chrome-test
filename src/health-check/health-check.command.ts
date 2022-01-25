interface HealthCheckResponse {
  success: boolean
}

export class HealthCheckCommand {
  constructor(protected db: FirebaseFirestore.Firestore) {}

  public async execute(): Promise<HealthCheckResponse> {
    await this.db.listCollections()

    return { success: true }
  }
}
