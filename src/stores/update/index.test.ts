import { fetchAvailableUpdate } from '@/services/updates';
import { useSettingsStore } from '@/stores/settings';

import { useUpdateStore } from '.';

const update = { version: '1.2.0', notes: '', downloadUrl: 'https://x/app.apk', publishedAt: null };

jest.mock('@/services/updates', () => ({ fetchAvailableUpdate: jest.fn(), simulatedUpdate: jest.fn() }));
jest.mock('@/database/repositories/settings', () => ({
  settingsRepository: { getAll: jest.fn(async () => ({})), set: jest.fn(async () => undefined) },
}));

const fetchMock = fetchAvailableUpdate as jest.MockedFunction<typeof fetchAvailableUpdate>;

/** Nova abertura do app: store da sessão zerado, settings mantidas. */
const reopen = () => useUpdateStore.setState({ available: null, checked: false });

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 24, 9, 0) });
  useSettingsStore.setState({ settings: {} });
  reopen();
  fetchMock.mockReset();
});

afterEach(() => jest.useRealTimers());

describe('useUpdateStore', () => {
  it('não pede nada quando não há versão nova', async () => {
    fetchMock.mockResolvedValue(null);
    expect(await useUpdateStore.getState().check()).toBe(false);
  });

  it('mostra o aviso, e depois de pular só volta em outro dia', async () => {
    fetchMock.mockResolvedValue(update);
    expect(await useUpdateStore.getState().check()).toBe(true);

    await useUpdateStore.getState().skipToday();
    expect(useSettingsStore.getState().settings.updates).toEqual({ skippedOn: '2026-11-24', skippedVersion: '1.2.0' });

    // Mesmo dia, mais tarde: não aparece.
    reopen();
    jest.setSystemTime(new Date(2026, 10, 24, 22, 30));
    expect(await useUpdateStore.getState().check()).toBe(false);

    // Dia seguinte: aparece de novo.
    reopen();
    jest.setSystemTime(new Date(2026, 10, 25, 7, 0));
    expect(await useUpdateStore.getState().check()).toBe(true);
  });

  it('verifica só uma vez por sessão', async () => {
    fetchMock.mockResolvedValue(update);
    await useUpdateStore.getState().check();
    expect(await useUpdateStore.getState().check()).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
