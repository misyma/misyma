import { RxDotsHorizontal } from 'react-icons/rx';

export interface BreadcrumbsProps {
  crumbs: Record<number, JSX.Element>;
}

export const Breadcrumbs = ({ crumbs }: BreadcrumbsProps): JSX.Element => {
  const entries = Object.entries(crumbs);

  return (
    <div className="flex flex-row gap-2 w-full justify-center items-center align-middle py-4">
      {entries.map(([key, value], i) => (
        <>
          <div key={`${key}-breadcrumb`}>{value}</div>
          {i < entries.length - 1 ? <RxDotsHorizontal /> : null}
        </>
      ))}
    </div>
  );
};
