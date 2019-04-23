import React, { useCallback } from 'react';

import { useMachine } from '@xstate/react';

import { Machine, assign, DoneInvokeEvent } from 'xstate';
import { service } from './service';
import { ApolloQueryResult } from 'apollo-client';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Flex } from 'rebass';
import { RouterProps, RouteComponentProps } from 'react-router';
import { GetElections } from './generated/GetElections';

import {
  Draggable,
  DraggableProvided,
  DroppableProvided,
  DragDropContext,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';

interface CandidateProps {
  id: string;
  name: string;
  description: string;
}

interface Context {
  electionId: string;
  candidatesWithoutVotes: CandidateProps[];
  candidatesWithVotes: CandidateProps[];
}

interface StateSchema {
  states: {
    loading: {};
    voting: {};
  };
}

type Event = {
  type: 'ORDER_CHANGED';
  payload: {
    candidatesWithoutVotes: CandidateProps[];
    candidatesWithVotes: CandidateProps[];
  };
};

export const ballotMachine = Machine<Context, StateSchema, Event>({
  id: 'ballot',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: ctx => {
          return service.GetElections({ ids: [ctx.electionId] });
        },
        onDone: {
          target: 'voting',
          actions: [
            assign((_ctx, event: DoneInvokeEvent<ApolloQueryResult<GetElections>>) => {
              return {
                candidatesWithoutVotes: event.data.data.getElections.elections[0].candidates.map(
                  candidate => ({
                    ...candidate,
                    description: candidate.description ? candidate.description : '',
                  })
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
    voting: {
      on: {
        ORDER_CHANGED: {
          actions: [
            assign((_ctx, event) => {
              return {
                candidatesWithoutVotes: event.payload.candidatesWithoutVotes,
                candidatesWithVotes: event.payload.candidatesWithVotes,
              };
            }),
          ],
        },
      },
    },
  },
});

export interface Props extends RouteComponentProps<{ id: string }> {}
export const BallotPage: React.FC<Props> = props => {
  const [current, send] = useMachine(
    ballotMachine.withConfig(
      {},
      {
        electionId: props.match.params.id,
        candidatesWithoutVotes: [],
        candidatesWithVotes: [],
      }
    )
  );

  const onDragEnd = useCallback(
    ({ source, destination }: DropResult) => {
      if (!destination || !source) {
        return;
      }

      const sourceDropableId =
        source.droppableId === 'candidatesWithoutVotes'
          ? 'candidatesWithoutVotes'
          : 'candidatesWithVotes';
      const destinationDroppableId =
        destination.droppableId === 'candidatesWithoutVotes'
          ? 'candidatesWithoutVotes'
          : 'candidatesWithVotes';

      if (source.droppableId === destination.droppableId) {
        if (source.index === destination.index) {
          return;
        }

        if (source.droppableId === 'candidatesWithoutVotes') {
          const rearrangedCandidates = reorder(
            current.context.candidatesWithoutVotes,
            source.index,
            destination.index
          );
          send({
            type: 'ORDER_CHANGED',
            payload: {
              candidatesWithoutVotes: rearrangedCandidates,
              candidatesWithVotes: current.context.candidatesWithVotes,
            },
          });
        }

        if (source.droppableId === 'candidatesWithVotes') {
          const rearrangedCandidates = reorder(
            current.context.candidatesWithVotes,
            source.index,
            destination.index
          );
          send({
            type: 'ORDER_CHANGED',
            payload: {
              candidatesWithoutVotes: current.context.candidatesWithoutVotes,
              candidatesWithVotes: rearrangedCandidates,
            },
          });
        }
      } else {
        const [sourceList, destinationList] = move(
          current.context[sourceDropableId],
          current.context[destinationDroppableId],
          source.index,
          destination.index
        );

        const payload: {
          candidatesWithoutVotes: CandidateProps[];
          candidatesWithVotes: CandidateProps[];
        } = {
          candidatesWithoutVotes: [],
          candidatesWithVotes: [],
        };

        payload[sourceDropableId] = sourceList;
        payload[destinationDroppableId] = destinationList;

        console.log(payload);

        send({
          type: 'ORDER_CHANGED',
          payload,
        });
      }
    },
    [current.context, send]
  );

  if (current.matches('loading')) {
    return <div>loading...</div>;
  }

  return (
    <div style={{ padding: '15px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'candidatesWithVotes'}>
          {(provided: DroppableProvided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                margin: '25px',
                padding: '20px',
                border: '1px red solid',
                minHeight: '50px',
              }}
            >
              {current.context.candidatesWithVotes.map((candidate, i) => (
                <Candidate key={candidate.id} index={i} candidate={candidate} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId={'candidatesWithoutVotes'}>
          {(provided: DroppableProvided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                margin: '25px',
                padding: '20px',
                border: '1px green solid',
                minHeight: '50px',
              }}
            >
              {current.context.candidatesWithoutVotes.map((candidate, i) => (
                <Candidate key={candidate.id} index={i} candidate={candidate} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

const Candidate: React.FC<{ candidate: CandidateProps; index: number }> = ({
  candidate,
  index,
}) => {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided: DraggableProvided) => (
        <div
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <Typography variant="h4">{candidate.name}</Typography>
          <Typography variant="caption">{candidate.description}</Typography>
        </div>
      )}
    </Draggable>
  );
};

// a little function to help us with reordering the result
function reorder(list: any[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

//Moves an item from one list to another list.
function move<T>(
  source: T[],
  destination: T[],
  sourceIndex: number,
  destinationIndex: number
): [T[], T[]] {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);

  console.log(sourceClone);
  console.log(destClone);

  const [removed] = sourceClone.splice(sourceIndex, 1);
  destClone.splice(destinationIndex, 0, removed);

  console.log(sourceClone);
  console.log(destClone);

  return [sourceClone, destClone];
}
