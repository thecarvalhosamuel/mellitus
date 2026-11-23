import { getDatabase } from '../../client';

export type Attachment = {
  id: string;
  patternId: string;
  /** Caminho relativo ao documentDirectory (o absoluto muda entre instalações no iOS). */
  fileUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf';
  createdAt: string;
};

type AttachmentRow = {
  id: string;
  pattern_id: string;
  file_uri: string;
  mime_type: Attachment['mimeType'];
  created_at: string;
};

const fromRow = (row: AttachmentRow): Attachment => ({
  id: row.id,
  patternId: row.pattern_id,
  fileUri: row.file_uri,
  mimeType: row.mime_type,
  createdAt: row.created_at,
});

// Só os metadados. Copiar e apagar os arquivos fica no serviço de anexos (etapa 10).
export const attachmentsRepository = {
  async listByPattern(patternId: string): Promise<Attachment[]> {
    const rows = await getDatabase().getAllAsync<AttachmentRow>(
      'SELECT * FROM attachments WHERE pattern_id = ? ORDER BY created_at ASC',
      [patternId],
    );
    return rows.map(fromRow);
  },

  async add(attachment: Omit<Attachment, 'createdAt'>): Promise<Attachment> {
    const createdAt = new Date().toISOString();
    await getDatabase().runAsync(
      'INSERT INTO attachments (id, pattern_id, file_uri, mime_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [attachment.id, attachment.patternId, attachment.fileUri, attachment.mimeType, createdAt],
    );
    return { ...attachment, createdAt };
  },

  async remove(id: string): Promise<void> {
    await getDatabase().runAsync('DELETE FROM attachments WHERE id = ?', [id]);
  },
};
