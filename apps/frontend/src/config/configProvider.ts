import { NodeEnv } from './environmentVariables';

export class ConfigProvider {
  public static getNodeEnv(): NodeEnv {
    return process.env.NODE_ENV as NodeEnv;
  }
}
