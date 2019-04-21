import { Machine, assign } from 'xstate';
import { service, createServiceWithAccessToken } from './service';

interface Context {
  id: string;
  name: string;
  description: string;
  candidates: {
    id: string;
    name: string;
    description: string;
  }[];
}

type Event =
  | {
      type: 'NAME_CHANGED';
      payload: {
        name: string;
      };
    }
  | {
      type: 'DESCRIPTION_CHANGED';
      payload: {
        name: string;
      };
    }
  | {
      type: 'CANDIDATE_ADDED';
      payload: {
        id: string;
        name: string;
        description: string;
      };
    }
  | {
      type: 'CANDIDATE_REMOVED';
      payload: {
        id: string;
      };
    }
  | {
      type: 'ELECTION_STARTED';
    };

interface StateSchema {
  states: {
    idle: {};
    pending: {};
    created: {};
  };
}

export const createElectionMachine = Machine<Context, StateSchema, Event>({
  id: 'create-election',
  initial: 'idle',
  states: {
    idle: {
      on: {
        NAME_CHANGED: {
          actions: [
            assign((_ctx, event) => {
              return {
                name: event.payload.name,
              };
            }),
          ],
        },
        DESCRIPTION_CHANGED: {
          actions: [
            assign((_ctx, event) => {
              return {
                description: event.payload.name,
              };
            }),
          ],
        },
        CANDIDATE_ADDED: {
          actions: [
            assign((ctx, event) => {
              return {
                candidates: [
                  ...ctx.candidates,
                  {
                    id: event.payload.id,
                    name: event.payload.name,
                    description: event.payload.description,
                  },
                ],
              };
            }),
          ],
        },
        CANDIDATE_REMOVED: {
          actions: [
            assign((ctx, event) => {
              return {
                candidates: ctx.candidates.filter(({ id }) => id !== event.payload.id),
              };
            }),
          ],
        },
        ELECTION_STARTED: {
          target: 'pending',
        },
      },
    },
    pending: {
      invoke: {
        src: ctx => {
          return service
            .CreateElection({
              name: ctx.name,
              description: ctx.description,
              candidates: ctx.candidates,
              email: 'christopher.langager@gmail.com',
            })
            .then(async res => {
              const adminToken = res.data!.createElection.adminToken!;
              const loginResponse = await service.WeakLogin({ adminToken });
              const accessToken = loginResponse.data!.weakLogin.accessToken;
              const serviceWithToken = createServiceWithAccessToken(accessToken);

              const id = res.data!.createElection.election.id;
              return serviceWithToken.StartElection({ id });
            });
        },
        onDone: {
          target: 'created',
        },
        onError: {
          actions: (_ctx, err) => {
            console.log(err);
          },
        },
      },
    },
    created: {
      onEntry: ['notifyCreated'],
    },
  },
});
