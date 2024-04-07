export interface BreadcrumbsProps {
  crumbs: Record<number, JSX.Element>;
}

export const Breadcrumbs = ({ crumbs }: BreadcrumbsProps): JSX.Element => {
  return (
    <div className="flex flex-row gap-4 w-full justify-center items-center align-middle">
      {Object.entries(crumbs).map(([key, value]) => (
        <div key={`${key}-breadcrumb`}>{value}</div>
      ))}
    </div>
  );
};
