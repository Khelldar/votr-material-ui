/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ElectionStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetElections
// ====================================================

export interface GetElections_getElections_elections_statusTransitions {
  __typename: "ElectionStatusTransition";
  on: string;
  status: ElectionStatus;
}

export interface GetElections_getElections_elections {
  __typename: "Election";
  id: string;
  name: string;
  description: string;
  status: ElectionStatus;
  statusTransitions: GetElections_getElections_elections_statusTransitions[];
}

export interface GetElections_getElections {
  __typename: "GetElectionsResponse";
  elections: GetElections_getElections_elections[];
}

export interface GetElections {
  getElections: GetElections_getElections;
}

export interface GetElectionsVariables {
  ids: string[];
}
