/* eslint-disable @typescript-eslint/naming-convention */

export interface EIsbnMessage {
  readonly ONIXMessage: {
    readonly Product: EIsbnBook | EIsbnBook[];
    readonly 'eisbn:nextPage'?: string;
  };
}

export interface EIsbnBook {
  readonly ProductIdentifier: EIsbnProductID | EIsbnProductID[];
  readonly DescriptiveDetail: {
    readonly ProductForm: string;
    readonly TitleDetail: EIsbnTitleDetail | EIsbnTitleDetail[];
    readonly Contributor?: EIsbnContributor | EIsbnContributor[];
    readonly Language?: {
      readonly LanguageCode: string;
    };
  };
  readonly CollateralDetail?: {
    readonly SupportingResource?: {
      readonly ResourceVersion?: {
        readonly ResourceLink?: string;
      };
    };
  };
  readonly PublishingDetail: {
    readonly Publisher: {
      readonly PublisherName?: string;
    };
    readonly PublishingDate: EIsbnDate | EIsbnDate[];
  };
}

export interface EIsbnTitleDetail {
  readonly TitleElement: {
    readonly TitleText: string;
  };
}

export interface EIsbnProductID {
  readonly ProductIDType: number;
  readonly IDValue: unknown;
}

export interface EIsbnContributor {
  readonly ContributorRole: string;
  readonly PersonNameInverted?: string;
}

export interface EIsbnDate {
  readonly Date: number;
}
