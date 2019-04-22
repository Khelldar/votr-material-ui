import React, { useRef, useImperativeHandle, useCallback } from 'react';

import { useMachine } from '@xstate/react';

import { Machine, assign, DoneInvokeEvent } from 'xstate';
import {
  ListElections_listElections_elections,
  ListElections,
} from './generated/ListElections';
import { service } from './service';
import { ApolloQueryResult } from 'apollo-client';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
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
  candidates: CandidateProps[];
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
    candidates: { id: string; name: string; description: string }[];
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
                candidates: event.data.data.getElections.elections[0].candidates.map(
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
                candidates: event.payload.candidates,
              };
            }),
          ],
        },
      },
    },
  },
});

// a little function to help us with reordering the result
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export interface Props extends RouteComponentProps<{ id: string }> {}
export const BallotPage: React.FC<Props> = props => {
  const [current, send] = useMachine(
    ballotMachine.withConfig({}, { electionId: props.match.params.id, candidates: [] })
  );

  // const onDragEnd = (result: DropResult) => {
  //   console.log(result);
  //   // const dragCandidate = current.context.candidates[dragIndex];
  //   // const newOrder = update(current.context.candidates, {
  //   //   $splice: [[dragIndex, 1], [hoverIndex, 0, dragCandidate]],
  //   // });

  //   // send('ORDER_CHANGED', {
  //   //   payload: {
  //   //     candidates: newOrder,
  //   //   },
  //   // });
  // };

  const onDragEnd = useCallback(
    ({ source, destination }: DropResult) => {
      if (!destination || !source) {
        return;
      }

      if (source.index === destination.index) {
        return;
      }

      const rearrangedCandidates = reorder(
        current.context.candidates,
        source.index,
        destination.index
      );

      send({ type: 'ORDER_CHANGED', payload: { candidates: rearrangedCandidates } });
    },
    [current.context.candidates, send]
  );

  if (current.matches('loading')) {
    return <div>loading...</div>;
  }

  return (
    <div style={{ padding: '15px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'storage-area-list'}>
          {(provided: DroppableProvided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div>droppable</div>
              {current.context.candidates.map((candidate, i) => (
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
