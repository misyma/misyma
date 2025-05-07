export class NationalLibraryPageMapper {
  public mapPages(rawData: string): number {
    const multiVolumeMatch = rawData.match(/\((.*?)\)/);

    if (multiVolumeMatch) {
      const volumesText = multiVolumeMatch[1];

      if (!volumesText) {
        throw new Error('No volumes found in the string: ' + rawData);
      }

      const volumes = volumesText
        .split(';')
        .map((vol) => vol.trim())
        .filter(Boolean);

      const pagesPerVolume = volumes.map((vol) => {
        const match = vol.match(/\b(\d+)\b/);

        if (!match || match.length < 2) {
          throw new Error('No page count found in the volume string: ' + vol);
        }

        return parseInt(match[1] as string, 10);
      });

      return pagesPerVolume.reduce((sum, pages) => sum + pages, 0);
    } else {
      const allNumbers = Array.from(rawData.matchAll(/\b\d+\b/g)).map((match) => parseInt(match[0], 10));

      return allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
    }
  }
}
