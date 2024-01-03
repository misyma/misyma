export class EmailEventTable {
  public readonly name = 'emailEvent';

  public readonly columns = {
    id: 'id',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    eventName: 'eventName',
    status: 'status',
    createdAt: 'createdAt',
  } as const;
}
