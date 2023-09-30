import { type AccessControlService } from './application/services/accessControlService/accessControlService.js';
import { AccessControlServiceImpl } from './application/services/accessControlService/accessControlServiceImpl.js';
import { type TokenService } from './application/services/tokenService/tokenService.js';
import { TokenServiceImpl } from './application/services/tokenService/tokenServiceImpl.js';
import { type AuthModuleConfig } from './authModuleConfig.js';
import { symbols } from './symbols.js';
import { type DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer.js';
import { type DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule.js';

export class AuthModule implements DependencyInjectionModule {
  public constructor(private readonly config: AuthModuleConfig) {}

  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToValue<AuthModuleConfig>(symbols.authModuleConfig, this.config);

    container.bind<TokenService>(
      symbols.tokenService,
      () => new TokenServiceImpl(container.get<AuthModuleConfig>(symbols.authModuleConfig)),
    );

    container.bind<AccessControlService>(
      symbols.accessControlService,
      () => new AccessControlServiceImpl(container.get<TokenService>(symbols.tokenService)),
    );
  }
}
