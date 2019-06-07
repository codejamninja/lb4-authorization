import * as path from 'path';
import { ApplicationConfig } from '@loopback/core';
import { BootMixin } from '@loopback/boot';
import { KeycloakAuthorizeActionProvider } from 'lb4-authorization-keycloak';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import {
  AuthorizationBindings,
  AuthorizationComponent
} from 'lb4-authorization';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import * as pkg from '../package.json';
import { MySequence } from './sequence';

export class Lb4AuthorizationApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication))
) {
  bootOptions = {
    controllers: {
      dirs: ['controllers'],
      extensions: ['.controller.js'],
      nested: true
    }
  };

  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.addComponents();
    this.addBindings();
    this.addSequences();
    this.addHome();
    this.addExplorer();
    this.api({
      openapi: '3.0.0',
      info: {
        title: pkg.name,
        version: pkg.version
      },
      paths: {},
      components: {
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http'
          },
          bearerAuth: {
            scheme: 'bearer',
            type: 'http'
          }
        }
      }
    });
  }

  addComponents() {
    this.component(AuthorizationComponent);
  }

  addBindings() {
    this.bind(AuthorizationBindings.Actions.AUTHORIZE).toProvider(
      KeycloakAuthorizeActionProvider
    );
  }

  addSequences() {
    this.sequence(MySequence);
  }

  addHome() {
    this.projectRoot = __dirname;
    this.static('/', path.join(__dirname, 'public'));
  }

  addExplorer() {
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer'
    });
    this.component(RestExplorerComponent);
  }
}
