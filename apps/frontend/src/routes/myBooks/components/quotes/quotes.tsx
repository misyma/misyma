import { FC } from 'react';

type Quote = {
    text: string;
};

interface Props {
  quotes: Quote[];
}

export const Quotes: FC<Props> = ({ quotes }: Props) => {
  return (
    <ul>
      {quotes.length > 0 ? (
        quotes.map((quote, index) => { //todo book name or something
          return <li key={`${index}-${quote.text}`}>{quote.text}</li>;
        })
      ) : (
        <li>Brak cytatów</li>
      )}
    </ul>
  );
};
