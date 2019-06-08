import { inject } from '@loopback/context';
import { AuthorizationBindings, AuthorizeAction } from 'lb4-authorization';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler
} from '@loopback/rest';

const { SequenceActions } = RestBindings;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthorizationBindings.Actions.AUTHORIZE)
    public authorize: AuthorizeAction
  ) {}

  async handle(context: RequestContext) {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);
      await this.authorize(context);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
