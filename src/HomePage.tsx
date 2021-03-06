import React from 'react';

import { useMachine } from '@xstate/react';

import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  ListElections_listElections_elections,
  ListElections,
} from './generated/ListElections';
import { service } from './service';
import { ApolloQueryResult } from 'apollo-client';
import { Card, CardContent, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { ElectionStatus } from './generated/globalTypes';

type Election = ListElections_listElections_elections;
interface Context {
  elections: Election[];
}

interface StateSchema {
  states: {
    loading: {};
    idle: {};
  };
}

type Event = {
  type: 'NOOP';
  payload: {};
};

export const listElectionsMachine = Machine<Context, StateSchema, Event>({
  id: 'create-election',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: ctx => {
          return service.ListElections({});
        },
        onDone: {
          target: 'idle',
          actions: [
            assign((_ctx, event: DoneInvokeEvent<ApolloQueryResult<ListElections>>) => {
              return {
                elections: event.data.data.listElections.elections.filter(
                  ({ status }) => status === ElectionStatus.OPEN
                ),
              };
            }),
          ],
        },
        onError: {
          actions: (_ctx, err) => {
            console.log(err);
          },
        },
      },
    },
    idle: {},
  },
});

export const HomePage: React.FC = () => {
  const [current] = useMachine(listElectionsMachine.withConfig({}, { elections: [] }));

  if (current.matches('loading')) {
    return <div>loading...</div>;
  }

  return (
    <>
      {current.context.elections.map(election => (
        <Link to={`/ballot/${election.id}`} style={{ textDecoration: 'none' }}>
          <Card key={election.id}>
            <CardContent>
              <Typography variant="h5">{election.name}</Typography>
              <Typography color="textSecondary">{election.description}</Typography>
              <Typography>{election.status}</Typography>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
};
