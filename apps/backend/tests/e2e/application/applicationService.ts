import { HttpMethodName } from '../../../src/common/types/http/httpMethodName.js';
import { type CheckHealthResponseBody } from '../../../src/core/api/httpControllers/applicationHttpController/schemas/checkHealthSchema.js';
import { type ConfigProvider } from '../../../src/core/configProvider.js';
import { type HttpService } from '../../../src/libs/httpService/services/httpService/httpService.js';

export class ApplicationService {
  private readonly healthPath = 'health';

  public constructor(
    private readonly httpService: HttpService,
    private readonly configProvider: ConfigProvider,
  ) {}

  public async checkHealth(): Promise<CheckHealthResponseBody> {
    const response = await this.httpService.sendRequest({
      method: HttpMethodName.get,
      url: `http://localhost:${this.configProvider.getServerPort()}/${this.healthPath}`,
    });

    return response.body as CheckHealthResponseBody;
  }
}
