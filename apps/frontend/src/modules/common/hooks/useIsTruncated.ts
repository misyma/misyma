import { RefObject, useEffect, useState } from 'react';

interface UseIsTruncatedProps {
	parentRef: RefObject<HTMLElement>;
	text: string;
}
export const useIsTruncated = ({ parentRef, text }: UseIsTruncatedProps) => {
	const [isTruncated, setIsTruncated] = useState(false);

	useEffect(() => {
		if (!parentRef.current) {
			return;
		}

		const clone = parentRef.current.cloneNode(true) as HTMLParagraphElement;
		clone.id = '';
		clone.classList.remove('custom-truncate');
		clone.classList.add('custom-inline');

		const root = document.querySelector('body');
		root?.append(clone);
		const originalWidth = parentRef.current.getBoundingClientRect().width;
		const cloneWidth = clone.getBoundingClientRect().width;
		setIsTruncated(originalWidth < cloneWidth);

		clone.remove();
	}, [text, parentRef]);

	return {
		isTruncated,
	};
};
