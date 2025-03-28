/* eslint-disable @typescript-eslint/naming-convention */
export interface NationalLibraryResponseBody {
  nextPage: string;
  bibs: NationalLibraryBook[];
}

export interface NationalLibraryBook {
  title: string;
  genre?: string;
  marc: Marc;
}

export interface Marc {
  fields: Field[];
}

export interface Field {
  '020'?: N020;
  '100'?: N100;
  '245'?: N245;
  '260'?: N260;
  '300'?: N300;
  '655'?: N655;
  '700'?: N700;
}

export interface N020 {
  ind1: string;
  ind2: string;
  subfields: Subfield2[];
}

export interface Subfield2 {
  a: string;
}

export interface N100 {
  ind1: string;
  ind2: string;
  subfields: Subfield7[];
}

export interface Subfield7 {
  a?: string;
  d?: string;
}

export interface N245 {
  ind1: string;
  ind2: string;
  subfields: Subfield8[];
}

export interface Subfield8 {
  a?: string;
  c?: string;
}

export interface N260 {
  ind1: string;
  ind2: string;
  subfields: Subfield11[];
}

export interface Subfield11 {
  a?: string;
  b?: string;
  c?: string;
  e?: string;
  f?: string;
}

export interface N300 {
  ind1: string;
  ind2: string;
  subfields: Subfield12[];
}

export interface Subfield12 {
  a?: string;
  c?: string;
}

export interface N655 {
  ind1: string;
  ind2: string;
  subfields: Subfield19[];
}

export interface Subfield19 {
  a?: string;
  y?: string;
  '2'?: string;
}

export interface N700 {
  ind1: string;
  ind2: string;
  subfields: Subfield20[];
}

export interface Subfield20 {
  a?: string;
  e?: string;
}
