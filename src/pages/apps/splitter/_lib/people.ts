// Resolving a person id to a display name had no home - it was reimplemented in
// every view. This module owns it: build the index once, resolve through it.

import type {Person} from './types';

export const PLACEHOLDER_NAME = '-';

export type PeopleIndex = Map<string, string>;

export const indexPeople = (people: Person[]): PeopleIndex =>
    new Map(people.map(p => [p.id, p.name]));

export const nameFrom = (index: PeopleIndex, id: string): string =>
    index.get(id) ?? PLACEHOLDER_NAME;
