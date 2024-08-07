/* eslint-disable @typescript-eslint/naming-convention */

export interface EIsbnMessage {
  readonly ONIXMessage: {
    readonly Product: EIsbnBook | EIsbnBook[];
  };
}

export interface EIsbnBook {
  readonly ProductIdentifier: EIsbnProductID | EIsbnProductID[];
  readonly DescriptiveDetail: {
    readonly ProductForm: string;
    readonly TitleDetail: {
      readonly TitleElement: {
        readonly TitleText: string;
      };
    };
    readonly Contributor: EIsbnContributor | EIsbnContributor[];
    readonly Language: {
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
      readonly PublisherName: string;
    };
    readonly PublishingDate: EIsbnDate | EIsbnDate[];
  };
}

export interface EIsbnProductID {
  readonly ProductIDType: number;
  readonly IDValue: unknown;
}

export interface EIsbnContributor {
  readonly PersonNameInverted: string;
}

export interface EIsbnDate {
  readonly Date: number;
}
