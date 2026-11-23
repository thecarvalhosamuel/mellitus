import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import { attachmentsRepository, type Attachment } from '@/database/repositories/attachments';
import { patternsRepository, type StoredPattern } from '@/database/repositories/patterns';
import { deleteAttachmentFile, importAttachment, type PickedFile } from '@/services/attachments';
import type { ClinicalPattern } from '@/shared/types/pattern';

export type AttachmentChanges = {
  /** Arquivos escolhidos agora, ainda fora da pasta do app. */
  added: PickedFile[];
  /** Anexos já salvos que o usuário removeu. */
  removed: Attachment[];
};

type PatternsState = {
  patterns: StoredPattern[];
  active: StoredPattern | null;
  load(): Promise<void>;
  /** Otimista: troca o ativo na hora e reverte se o banco falhar. */
  activate(id: string): Promise<void>;
  save(pattern: ClinicalPattern, opts: { activate: boolean }): Promise<StoredPattern>;
  /** Salva o padrão com seus anexos: copia os arquivos novos e apaga os removidos. */
  saveWithAttachments(
    pattern: ClinicalPattern,
    opts: { activate: boolean },
    changes: AttachmentChanges,
  ): Promise<StoredPattern>;
  listAttachments(patternId: string): Promise<Attachment[]>;
  /** Exclui um padrão personalizado inativo e os arquivos dos seus anexos. */
  remove(id: string): Promise<void>;
};

const withActive = (patterns: StoredPattern[], id: string): StoredPattern[] =>
  patterns.map((p) =>
    p.id === id ? { ...p, status: 'active' } : p.status === 'active' ? { ...p, status: 'inactive' } : p,
  );

export const usePatternsStore = create<PatternsState>()((set, get) => ({
  patterns: [],
  active: null,

  async load() {
    const patterns = await patternsRepository.list();
    set({ patterns, active: patterns.find((p) => p.status === 'active') ?? null });
  },

  async activate(id) {
    const previous = get();
    const patterns = withActive(previous.patterns, id);
    set({ patterns, active: patterns.find((p) => p.id === id) ?? previous.active });
    try {
      await patternsRepository.activate(id);
    } catch (error) {
      set({ patterns: previous.patterns, active: previous.active });
      throw error;
    }
  },

  async save(pattern, opts) {
    const saved = await patternsRepository.save(pattern, opts);
    await get().load();
    return saved;
  },

  async saveWithAttachments(pattern, opts, changes) {
    // 1. Copia os arquivos novos para a pasta do app (fora da transação do banco).
    const copied: Omit<Attachment, 'createdAt'>[] = [];
    try {
      for (const file of changes.added) {
        const id = randomUUID();
        const fileUri = await importAttachment(file, id);
        copied.push({ id, patternId: pattern.id, fileUri, mimeType: file.mimeType });
      }
      // 2. Padrão e anexos no banco, juntos.
      const saved = await patternsRepository.saveWithAttachments(pattern, {
        activate: opts.activate,
        add: copied,
        removeIds: changes.removed.map((a) => a.id),
      });
      // 3. Só depois de gravar, apaga os arquivos removidos.
      changes.removed.forEach((a) => deleteAttachmentFile(a.fileUri));
      await get().load();
      return saved;
    } catch (error) {
      copied.forEach((a) => deleteAttachmentFile(a.fileUri));
      throw error;
    }
  },

  listAttachments(patternId) {
    return attachmentsRepository.listByPattern(patternId);
  },

  async remove(id) {
    const attachments = await attachmentsRepository.listByPattern(id);
    await patternsRepository.remove(id);
    attachments.forEach((a) => deleteAttachmentFile(a.fileUri));
    await get().load();
  },
}));
