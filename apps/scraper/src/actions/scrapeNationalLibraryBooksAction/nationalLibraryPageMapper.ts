export class NationalLibraryPageMapper {
  public mapPages(rawData: string): number {
    const multiVolumeMatch = rawData.match(/\(([^)]*\d[^)]*)\)/);
    if (multiVolumeMatch) {
      const volumesText = multiVolumeMatch[1];

      if (!volumesText) {
        return 0;
      }

      const volumes = volumesText
        .split(';')
        .map((vol) => vol.trim())
        .filter(Boolean);

      const pagesPerVolume = volumes.map((vol) => {
        const match = vol.match(/\b(\d+)\b/);

        if (!match || match.length < 2) {
          return 0;
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
