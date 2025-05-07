import { beforeEach, expect, describe, it } from 'vitest';

import { NationalLibraryPageMapper } from './nationalLibraryPageMapper.js';

describe('NationalLibraryPageMapper', () => {
  let mapper: NationalLibraryPageMapper;

  beforeEach(async () => {
    mapper = new NationalLibraryPageMapper();
  });

  it('maps multi volumne to total pages', () => {
    const rawPages = '4 t. (597, [3] ; 656, [3] ; 687, [1] ; 674, [2] s.) ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(2614); // 597 + 656 + 687 + 674
  });

  it('maps single volume to total pages v1', () => {
    const rawPages = 'VII, [1], 405, [1] strona :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(405);
  });

  it('maps single volume to total pages v2', () => {
    const rawPages = ':XIV, 399 stron. ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(399);
  });

  it('maps single to total pages v3', () => {
    const rawPages = '48 s. :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(48);
  });

  it('maps single to total pages v4', () => {
    const rawPages = '835, [1] s. ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(835);
  });

  it('maps single to total pages v5', () => {
    const rawPages = '102, [2] s. ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(102);
  });

  it('maps single to total pages v6', () => {
    const rawPages = '360 s., [32] s. tabl. :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(360);
  });

  it('maps single to total pages v7', () => {
    const rawPages = '[2], 180, [1] s. :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(180);
  });

  it('maps single to total pages v8', () => {
    const rawPages = '  26 s. ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(26);
  });

  it('maps single to total pages v9', () => {
    const rawPages = 'S. 1329-1344 :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(1344);
  });

  it('maps single to total pages v10', () => {
    const rawPages = '[10], 430 s. :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(430);
  });

  it('maps single to total pages v11', () => {
    const rawPages = '195 s. ;';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(195);
  });

  it('maps single to total pages v12', () => {
    const rawPages = '588 s., [48] s. tabl. :';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(588);
  });

  it('maps single to total pages v13', () => {
    const rawPages = ' 774 ';

    const result = mapper.mapPages(rawPages);

    expect(result).toBe(774);
  });
});
