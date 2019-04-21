import { Machine, assign } from 'xstate';

interface Context {
  id: string;
  name: string;
  description: string;
  candidateInput: {
    name: string;
    description: string;
  };
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
    };

interface StateSchema {
  states: {
    idle: {};
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
                candidateInput: {
                  name: '',
                  description: '',
                },
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
      },
    },
  },
});