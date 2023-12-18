export interface E2ETestsSettings {
  credentials: {
    email: string;
    password: string;
  };
  application: {
    url: string;
  };
  useMocks: boolean;
}
