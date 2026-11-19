import { fontAssets, fontFamily } from '.';

describe('typography', () => {
  it('toda família usada pela UI tem a fonte carregada', () => {
    for (const family of Object.values(fontFamily)) {
      expect(fontAssets).toHaveProperty(family);
    }
  });
});
