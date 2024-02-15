export interface GenreState {
  id: string;
  name: string;
}

export class Genre {
  public constructor(private readonly state: GenreState) {}

  public getId(): string {
    return this.state.id;
  }

  public getName(): string {
    return this.state.name;
  }

  public getState(): GenreState {
    return this.state;
  }
}
