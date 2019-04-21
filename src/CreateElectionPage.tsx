import React, { useCallback } from 'react';
import TextField from '@material-ui/core/TextField';
import { useMachine } from '@xstate/react';
import { createElectionMachine } from './createElectionMachine';
import * as uuid from 'uuid';
import { Paper, FormLabel, Button } from '@material-ui/core';
import { Flex } from 'rebass';

export const CreateElectionPage: React.FC = () => {
  const [current, send] = useMachine(
    createElectionMachine.withConfig(
      {},
      {
        id: uuid.v4(),
        name: '',
        description: '',
        candidateInput: { name: '', description: '' },
        candidates: [],
      }
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

  const onCandidateInputDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      send('DESCRIPTION_CHANGED', {
        payload: {
          name: e.target.value,
        },
      });
    },
    [send]
  );

  return (
    <div style={{ padding: '15px' }}>
      <h1>Create Election</h1>
      <form noValidate autoComplete="off">
        <Flex width={3 / 4} flexDirection="column">
          <TextField
            label="name"
            margin="normal"
            value={current.context.name}
            onChange={onNameChange}
          />

          <TextField
            label="description"
            multiline
            rows="4"
            margin="normal"
            value={current.context.description}
            onChange={onDescriptionChange}
          />

          <Paper style={{ padding: '10px' }}>
            <form
              onSubmit={e => {
                //not sure I want to use this
                e.preventDefault();

                //@ts-ignore
                const data = new FormData(e.target);

                const name = data.get('name');
                const description = data.get('description');

                send('CANDIDATE_ADDED', {
                  payload: {
                    id: uuid.v4(),
                    name,
                    description,
                  },
                });

                //@ts-ignore
                e.target.reset();
              }}
            >
              <Flex flexDirection="column">
                <TextField required name="name" label="candidate name" margin="normal" />
                <TextField
                  name="description"
                  label="candidate description"
                  multiline
                  rows="2"
                  margin="normal"
                />
                <Button type="submit">add candidate</Button>
              </Flex>
            </form>
          </Paper>
          <ul>
            {current.context.candidates.map(candidate => (
              <li>
                {candidate.name} - {candidate.description}
              </li>
            ))}
          </ul>
        </Flex>
      </form>
    </div>
  );
};
