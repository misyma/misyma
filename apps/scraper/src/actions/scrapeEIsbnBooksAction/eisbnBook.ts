 

export interface EisbnResponseBody {
  readonly ONIXMessage?: {
    readonly Product?: EisbnBook | EisbnBook[];
    readonly 'eisbn:nextPage'?: string;
  };
}

export interface EisbnBook {
  readonly ProductIdentifier: EIsbnProductID | EIsbnProductID[];
  readonly DescriptiveDetail: {
    readonly ProductForm?: string;
    readonly TitleDetail?: EIsbnTitleDetail | EIsbnTitleDetail[];
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
  readonly PublishingDetail?: {
    readonly Publisher?: {
      readonly PublisherName?: string;
    };
    readonly PublishingDate?: EIsbnDate | EIsbnDate[];
  };
}

export interface EIsbnTitleDetail {
  readonly TitleElement?: {
    readonly TitleText?: string;
  };
}

export interface EIsbnProductID {
  readonly ProductIDType: number;
  readonly IDValue: unknown;
}

export interface EIsbnContributor {
  readonly ContributorRole: string;
  readonly PersonNameInverted?: string | number;
}

export interface EIsbnDate {
  readonly Date: number;
}
