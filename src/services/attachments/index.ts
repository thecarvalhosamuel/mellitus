import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import type { Attachment } from '@/database/repositories/attachments';

// Receitas e laudos ficam em documentDirectory/attachments/; o banco guarda só o
// caminho relativo, porque o absoluto muda entre instalações no iOS (DESIGN.md §13.3).

const FOLDER = 'attachments';

export type AttachmentMime = Attachment['mimeType'];

/** Arquivo escolhido pelo usuário, ainda fora da pasta do app. */
export type PickedFile = { uri: string; mimeType: AttachmentMime; name: string };

const extensionFor = (mime: AttachmentMime) => (mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg');

const normalizeMime = (mime?: string | null): AttachmentMime =>
  mime === 'application/pdf' ? 'application/pdf' : mime === 'image/png' ? 'image/png' : 'image/jpeg';

/** Copia o arquivo para a pasta do app e devolve o caminho relativo a gravar no banco. */
export async function importAttachment(file: PickedFile, id: string): Promise<string> {
  const folder = new Directory(Paths.document, FOLDER);
  if (!folder.exists) folder.create({ intermediates: true, idempotent: true });
  const name = `${id}.${extensionFor(file.mimeType)}`;
  await new File(file.uri).copy(new File(folder, name));
  return `${FOLDER}/${name}`;
}

/** URI absoluta atual para exibir ou compartilhar um anexo. */
export function attachmentUri(relativePath: string): string {
  return new File(Paths.document, relativePath).uri;
}

/** Apaga o arquivo de um anexo; ausente não é erro. */
export function deleteAttachmentFile(relativePath: string): void {
  const file = new File(Paths.document, relativePath);
  if (file.exists) file.delete();
}

/** Apaga a pasta inteira de anexos ("Apagar todos os dados"). */
export function deleteAllAttachmentFiles(): void {
  const folder = new Directory(Paths.document, FOLDER);
  if (folder.exists) folder.delete();
}

/** Foto da receita ou do laudo pela galeria. `null` se cancelado. */
export async function pickImageAttachment(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: normalizeMime(asset.mimeType), name: asset.fileName ?? 'Foto' };
}

/** PDF ou imagem pelos arquivos do aparelho. `null` se cancelado. */
export async function pickDocumentAttachment(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, mimeType: normalizeMime(asset.mimeType), name: asset.name };
}
