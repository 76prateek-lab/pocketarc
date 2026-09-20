export type StoredBinary = Blob | ArrayBuffer

export async function toStoredBinary(value: StoredBinary): Promise<ArrayBuffer> {
  return isBlobLike(value) ? value.arrayBuffer() : value.slice(0)
}

export function toBlob(value: StoredBinary, type = 'application/octet-stream') {
  return isBlobLike(value) ? value : new Blob([value], { type })
}

export function binarySize(value: StoredBinary) {
  return isBlobLike(value) ? value.size : value.byteLength
}

export async function binaryBuffer(value: StoredBinary) {
  return isBlobLike(value) ? value.arrayBuffer() : value.slice(0)
}

function isBlobLike(value: StoredBinary): value is Blob { return typeof (value as Blob).arrayBuffer === 'function' && typeof (value as Blob).size === 'number' }
