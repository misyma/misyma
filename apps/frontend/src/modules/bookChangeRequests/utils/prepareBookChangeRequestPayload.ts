import { Book } from '@common/contracts';
import { AnyValidObject } from '../../common/utils/getDiffBetweenObjects';

interface Props {
  bookData: Book;
  changeRequestPayload: AnyValidObject;
}
export const prepareBookChangeRequestPayload = ({ bookData, changeRequestPayload }: Props) => {
  Object.entries(changeRequestPayload).forEach(([key]) => {
    if (changeRequestPayload[key] == '' && bookData[key as keyof typeof bookData] != null) {
      changeRequestPayload[key] = null;
    }
  });
};
