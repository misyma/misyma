import { ImgHTMLAttributes, PropsWithoutRef, forwardRef } from 'react';

export const RefreshingImage = forwardRef<HTMLImageElement, PropsWithoutRef<ImgHTMLAttributes<HTMLImageElement>>>(({ src, ...props }, ref) => {
  return (
    <img
      ref={ref}
      key={`${src}-${Date.now()}`}
      src={`${src}?t=${Date.now()}`}
      {...props}
    ></img>
  );
});
