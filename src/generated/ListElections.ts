/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ElectionStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: ListElections
// ====================================================

export interface ListElections_listElections_elections {
  __typename: "Election";
  id: string;
  name: string;
  description: string;
  dateUpdated: string;
  status: ElectionStatus;
}

export interface ListElections_listElections {
  __typename: "ListElectionsResponse";
  elections: ListElections_listElections_elections[];
}

export interface ListElections {
  listElections: ListElections_listElections;
}
