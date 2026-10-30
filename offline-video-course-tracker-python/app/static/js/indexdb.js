// Video files of "Local Files" courses are kept in IndexedDB under the same id as their
// video_progress row, so they survive reloads without ever leaving the browser.

const DB_NAME = "videoStore"
const STORE = "videos"

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" })
      }
    }
  })
}

async function withStore(mode, operate) {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const result = operate(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(result?.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** @param {{id: string, file: File, size: number, type: string}[]} videos */
export function storeVideos(videos) {
  return withStore("readwrite", (store) => {
    videos.forEach((video) => store.put(video))
  })
}

export function getVideo(id) {
  return withStore("readonly", (store) => store.get(id))
}

export function deleteVideos(ids) {
  return withStore("readwrite", (store) => {
    ids.forEach((id) => store.delete(id))
  })
}
