import { requestJson } from "./api.js"
import { deleteVideos, storeVideos } from "./indexdb.js"

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"]
const PREVIEW_LIMIT = 5

const addDialog = document.getElementById("add-dialog")
const editDialog = document.getElementById("edit-dialog")
const clientForm = document.getElementById("client-form")
const serverForm = document.getElementById("server-form")
const editForm = document.getElementById("edit-form")

const fsSupported = "showDirectoryPicker" in window
let pickedDirectory = null
let pickedVideos = []
let editingId = null

// ---- Generic helpers ----

function setError(form, message) {
  form.querySelector("[data-error]").textContent = message
}

async function withBusy(form, action) {
  const buttons = form.querySelectorAll("button")
  const previous = [...buttons].map((b) => b.disabled)
  buttons.forEach((b) => (b.disabled = true))
  setError(form, "")

  try {
    await action()
  } catch (error) {
    setError(form, error.message)
    buttons.forEach((b, i) => (b.disabled = previous[i]))
  }
}

document.querySelectorAll("dialog [data-action='close']").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close())
})

// ---- Add course ----

function showTab(name) {
  addDialog.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name))
  addDialog.querySelectorAll(".tab-panel").forEach((panel) => (panel.hidden = panel.dataset.panel !== name))
}

addDialog.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab))
})

function resetAddForms() {
  clientForm.reset()
  serverForm.reset()
  setError(clientForm, "")
  setError(serverForm, "")
  pickedDirectory = null
  pickedVideos = []
  renderPickedVideos()
}

document.querySelectorAll("[data-action='add-course']").forEach((button) => {
  button.addEventListener("click", () => {
    resetAddForms()
    showTab(fsSupported ? "client" : "server")
    addDialog.showModal()
  })
})

if (!fsSupported) {
  document.getElementById("tab-client").disabled = true
  document.getElementById("fs-unsupported").hidden = false
  document.getElementById("pick-directory").disabled = true
}

async function scanDirectory(dirHandle) {
  const found = []

  async function walk(handle, currentPath, section) {
    for await (const [name, entry] of handle.entries()) {
      const entryPath = currentPath ? `${currentPath}/${name}` : name

      if (entry.kind === "directory") {
        // The immediate parent folder becomes the section, as for server courses.
        await walk(entry, entryPath, name)
      } else if (VIDEO_EXTENSIONS.includes(name.slice(name.lastIndexOf(".")).toLowerCase())) {
        try {
          found.push({ file: await entry.getFile(), relativePath: entryPath, section })
        } catch (error) {
          console.error("Error accessing file:", name, error)
        }
      }
    }
  }

  await walk(dirHandle, "", "")

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" })
  return found.sort((a, b) => collator.compare(a.relativePath, b.relativePath))
}

function renderPickedVideos() {
  const container = document.getElementById("found-videos")
  const preview = document.getElementById("file-preview")
  const submit = clientForm.querySelector("button[type='submit']")

  document.getElementById("pick-directory").textContent = pickedDirectory ? pickedDirectory.name : "Select Directory"
  container.hidden = pickedVideos.length === 0
  submit.disabled = pickedVideos.length === 0
  preview.replaceChildren()

  if (pickedVideos.length === 0) return

  document.getElementById("found-count").textContent = `Found Videos (${pickedVideos.length})`

  const sections = Map.groupBy(pickedVideos, (video) => video.section || "Videos")
  for (const [section, files] of sections) {
    const group = document.createElement("div")
    const heading = document.createElement("div")
    heading.className = "strong"
    heading.textContent = section
    group.append(heading)

    for (const video of files.slice(0, PREVIEW_LIMIT)) {
      const line = document.createElement("div")
      line.className = "xsmall muted indent"
      line.textContent = video.file.name
      group.append(line)
    }

    if (files.length > PREVIEW_LIMIT) {
      const more = document.createElement("div")
      more.className = "xsmall muted indent italic"
      more.textContent = `... and ${files.length - PREVIEW_LIMIT} more files`
      group.append(more)
    }

    preview.append(group)
  }
}

document.getElementById("pick-directory").addEventListener("click", async () => {
  try {
    pickedDirectory = await window.showDirectoryPicker({ mode: "read" })
    clientForm.elements.name.value ||= pickedDirectory.name
    pickedVideos = await scanDirectory(pickedDirectory)
    setError(clientForm, pickedVideos.length === 0 ? "No video files found in that folder" : "")
    renderPickedVideos()
  } catch (error) {
    if (error.name !== "AbortError") {
      setError(clientForm, "Failed to access directory. Please try again.")
    }
  }
})

clientForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const name = clientForm.elements.name.value.trim()

  if (!name || pickedVideos.length === 0) {
    setError(clientForm, "Please enter a name and select a directory with video files")
    return
  }

  withBusy(clientForm, async () => {
    const videos = pickedVideos.map(({ file, section }) => ({
      id: `client_${crypto.randomUUID()}`,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      filename: file.name,
      section,
      file,
    }))

    // Store the files first so a course never points at videos the browser doesn't have.
    await storeVideos(videos.map(({ id, file }) => ({ id, file, size: file.size, type: file.type })))

    try {
      await requestJson("/api/courses", {
        method: "POST",
        body: {
          name,
          type: "client",
          courseData: { videos: videos.map(({ file, ...video }) => video) },
        },
      })
    } catch (error) {
      await deleteVideos(videos.map((video) => video.id)).catch(() => {})
      throw error
    }

    location.reload()
  })
})

serverForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const name = serverForm.elements.name.value.trim()
  const path = serverForm.elements.path.value.trim()

  if (!name || !path) {
    setError(serverForm, "Both course name and path are required")
    return
  }

  withBusy(serverForm, async () => {
    await requestJson("/api/courses", { method: "POST", body: { name, path, type: "server" } })
    location.reload()
  })
})

// ---- Edit / delete ----

document.querySelectorAll("[data-action='edit-course']").forEach((button) => {
  button.addEventListener("click", () => {
    editingId = button.dataset.id
    editForm.elements.name.value = button.dataset.name
    setError(editForm, "")
    editDialog.showModal()
  })
})

editForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const name = editForm.elements.name.value.trim()

  if (!name) {
    setError(editForm, "Course name is required")
    return
  }

  withBusy(editForm, async () => {
    await requestJson(`/api/courses/${encodeURIComponent(editingId)}`, { method: "PATCH", body: { name } })
    location.reload()
  })
})

document.querySelectorAll("[data-action='delete-course']").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!confirm(`Delete "${button.dataset.name}"? Your progress for it will be lost.`)) return

    const courseUrl = `/api/courses/${encodeURIComponent(button.dataset.id)}`

    try {
      // Free the browser storage held by a local-files course before its rows disappear.
      const videos = await requestJson(`${courseUrl}/videos`)
      const localIds = videos.filter((video) => video.blobUrl).map((video) => video.id)
      if (localIds.length > 0) {
        await deleteVideos(localIds).catch((error) => console.error("Failed to free local files:", error))
      }

      await requestJson(courseUrl, { method: "DELETE" })
      location.reload()
    } catch (error) {
      alert(`Failed to delete course: ${error.message}`)
    }
  })
})
