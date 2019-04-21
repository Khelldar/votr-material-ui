import React, { useCallback } from 'react';

import { useMachine } from '@xstate/react';
import { createElectionMachine } from './createElectionMachine';
import * as uuid from 'uuid';
import {
  Paper,
  FormLabel,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@material-ui/core';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import { Flex } from 'rebass';
import { AddCandidateForm } from './AddCandidateForm';

export const CreateElectionPage: React.FC = () => {
  const [current, send] = useMachine(
    createElectionMachine.withConfig(
      {},
      {
        id: uuid.v4(),
        name: '',
        description: '',
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

  const candidateAdded = useCallback(
    newCandidate => {
      send('CANDIDATE_ADDED', {
        payload: {
          id: newCandidate.id,
          name: newCandidate.name,
          description: newCandidate.description,
        },
      });
    },
    [send]
  );

  const candidateRemoved = useCallback(
    (id: string) => () => {
      send('CANDIDATE_REMOVED', {
        payload: {
          id,
        },
      });
    },
    [send]
  );

  return (
    <div style={{ padding: '15px' }}>
      <Flex width={1} flexDirection="column">
        <Flex flexDirection="row" justifyContent="space-between">
          <Typography variant="h4" gutterBottom>
            new election
          </Typography>

          <Button variant="contained" color="primary">
            start!
          </Button>
        </Flex>

        <TextField
          label="name"
          margin="normal"
          value={current.context.name}
          onChange={onNameChange}
        />

        <TextField
          label="description"
          margin="normal"
          value={current.context.description}
          onChange={onDescriptionChange}
        />

        <AddCandidateForm candidateAdded={candidateAdded} />

        <FormLabel style={{ marginTop: '10px' }}>candidates</FormLabel>
        {current.context.candidates.length === 0 && (
          <Flex justifyContent="center" my={15}>
            <Typography color="textSecondary" gutterBottom>
              NO CANDIDATES ADDED
            </Typography>
          </Flex>
        )}
        <List dense>
          {current.context.candidates.map(candidate => (
            <ListItem>
              <Flex
                alignItems="row"
                flexWrap="nowrap"
                justifyContent="space-between"
                width={1}
              >
                <Flex width={5 / 6}>
                  <ListItemText
                    style={{ width: '100%', overflow: 'scroll' }}
                    primary={candidate.name}
                    secondary={candidate.description}
                  />
                </Flex>
                <Flex alignItems="right" justifyContent="right">
                  <DeleteRoundedIcon onClick={candidateRemoved(candidate.id)} />
                </Flex>
              </Flex>
            </ListItem>
          ))}
        </List>
      </Flex>
    </div>
  );
};
