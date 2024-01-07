export class EmailEventTable {
  public readonly name = 'emailEvents';

  public readonly columns = {
    id: 'id',
    payload: 'payload',
    eventName: 'eventName',
    status: 'status',
    createdAt: 'createdAt',
  } as const;
}
