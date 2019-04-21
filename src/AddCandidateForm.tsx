import React, { useCallback } from 'react';
import TextField from '@material-ui/core/TextField';
import { useMachine } from '@xstate/react';
import * as uuid from 'uuid';
import { Paper, Button } from '@material-ui/core';
import { Flex } from 'rebass';
import { Machine, assign } from 'xstate';

interface Context {
  name: string;
  description: string;
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
            assign((_ctx, _event) => {
              return {
                name: '',
                description: '',
              };
            }),
            'notifyCandidateAdded',
          ],
        },
      },
    },
  },
});

export interface Props {
  candidateAdded: (newCandidate: {
    id: string;
    name: string;
    description: string;
  }) => void;
}

export const AddCandidateForm: React.FC<Props> = props => {
  const [current, send] = useMachine(
    createElectionMachine.withConfig(
      {
        actions: {
          notifyCandidateAdded: (_ctx, event) => {
            if (event.type === 'CANDIDATE_ADDED') {
              props.candidateAdded({
                id: event.payload.id,
                name: event.payload.name,
                description: event.payload.description,
              });
            }
          },
        },
      },
      { name: '', description: '' }
    )
  );

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      send('NAME_CHANGED', {
        payload: {
          name: e.target.value,
        },
      });
    },
    [send]
  );

  const onDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      send('DESCRIPTION_CHANGED', {
        payload: {
          name: e.target.value,
        },
      });
    },
    [send]
  );

  const onSubmit = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.preventDefault();
      //TODO: validation
      send('CANDIDATE_ADDED', {
        payload: {
          id: uuid.v4(),
          name: current.context.name,
          description: current.context.description,
        },
      });
    },
    [send, current.context]
  );

  return (
    <Paper style={{ padding: '10px' }}>
      <Flex flexDirection="column">
        <TextField
          label="candidate name"
          margin="dense"
          value={current.context.name}
          onChange={onNameChange}
        />
        <TextField
          label="candidate description"
          margin="dense"
          value={current.context.description}
          onChange={onDescriptionChange}
        />
        <Button variant="contained" onClick={onSubmit}>
          add candidate
        </Button>
      </Flex>
    </Paper>
  );
};
