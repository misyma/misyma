export interface DatabaseTable<Entity, TableName extends string> {
  readonly name: string;
  readonly allColumns: `${TableName}.*`;
  readonly columns: { readonly [Column in keyof Entity]: `${TableName}.${string & Column}` };
}
