export const awsRegions = {
  euCentral1: 'eu-central-1',
} as const;

export type AwsRegion = (typeof awsRegions)[keyof typeof awsRegions];
