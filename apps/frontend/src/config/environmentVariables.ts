export enum NodeEnv {
    development = 'development',
    ci = 'ci',
    staging = 'staging',
    production = 'production'
}

export interface EnvironmentVariables {
  http: {
    backendUrl: string;
    enableMocking: boolean;
  };
  nodeEnv: NodeEnv
}
