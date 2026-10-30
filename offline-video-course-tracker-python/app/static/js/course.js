import { formatTime, requestJson } from "./api.js"
import { getVideo } from "./indexdb.js"

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const PROGRESS_INTERVAL_S = 5

const { videos } = JSON.parse(document.getElementById("course-data").textContent)

const el = (id) => document.getElementById(id)
const videoEl = el("video")
const notesEl = el("notes")

const expandedSections = new Set(videos.map(sectionOf))
let current = videos.find((v) => !v.completed) || videos[0] || null
let objectUrl = null
let lastSavedTime = 0
let playbackRate = 1

function sectionOf(video) {
  return video.section || "Videos"
}

function saveProgress(fields) {
  return requestJson("/api/progress", { method: "POST", body: { videoId: current.id, ...fields } })
}

// ---- Sidebar ----

function renderSummary() {
  const done = videos.filter((v) => v.completed).length
  const percent = videos.length > 0 ? Math.round((done / videos.length) * 100) : 0

  el("course-percent").textContent = `${percent}% COMPLETE`
  el("course-progress").style.width = `${percent}%`
  el("course-count").textContent = `${done} of ${videos.length} videos completed`
}

function renderSidebar() {
  const list = el("video-list")
  list.replaceChildren()

  for (const [section, sectionVideos] of Map.groupBy(videos, sectionOf)) {
    const group = document.createElement("div")
    group.className = "section"

    const header = document.createElement("button")
    header.className = "section-header"
    header.innerHTML = `<span></span><span class="chevron">${expandedSections.has(section) ? "&#9662;" : "&#9656;"}</span>`
    header.firstElementChild.textContent = section
    header.addEventListener("click", () => {
      expandedSections.has(section) ? expandedSections.delete(section) : expandedSections.add(section)
      renderSidebar()
    })
    group.append(header)

    if (expandedSections.has(section)) {
      for (const video of sectionVideos) {
        group.append(renderVideoItem(video))
      }
    }

    list.append(group)
  }

  renderSummary()
}

function renderVideoItem(video) {
  const item = document.createElement("div")
  item.className = "video-item" + (video.id === current?.id ? " active" : "")

  const check = document.createElement("button")
  check.className = "check" + (video.completed ? " done" : "")
  check.title = video.completed ? "Mark as not completed" : "Mark as completed"
  check.innerHTML = video.completed ? "&#10003;" : ""
  check.addEventListener("click", () => toggleComplete(video))

  const body = document.createElement("button")
  body.className = "video-item-body"
  body.addEventListener("click", () => selectVideo(video))

  const title = document.createElement("div")
  title.className = "video-item-title" + (video.completed ? " completed" : "")
  title.textContent = video.title
  title.title = video.filename

  const meta = document.createElement("div")
  meta.className = "xsmall muted"
  meta.textContent = video.duration > 0 ? `${formatTime(video.watchTime)} / ${formatTime(video.duration)}` : "0:00 / 0:00"
  if (video.notes) meta.textContent += "  ·  Notes"

  body.append(title, meta)

  if (!video.completed && video.watchTime > 0 && video.duration > 0) {
    const bar = document.createElement("div")
    bar.className = "progress thin"
    bar.innerHTML = `<div class="progress-bar blue" style="width:${Math.min((video.watchTime / video.duration) * 100, 100)}%"></div>`
    body.append(bar)
  }

  item.append(check, body)
  return item
}

// ---- Player ----

async function loadSource(video) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  el("video-error").hidden = true

  if (!video.blobUrl) {
    videoEl.src = `/api/video/${encodeURIComponent(video.id)}`
    return
  }

  const stored = await getVideo(video.id).catch(() => undefined)
  if (!stored) {
    videoEl.removeAttribute("src")
    videoEl.load()
    el("video-error").textContent =
      "This video was added from local files in a different browser (or its storage was cleared). Re-add the course here to play it."
    el("video-error").hidden = false
    return
  }

  objectUrl = URL.createObjectURL(stored.file)
  videoEl.src = objectUrl
}

function renderPlayer() {
  el("player").hidden = !current
  el("no-videos").hidden = !!current
  if (!current) return

  const index = videos.indexOf(current)
  el("video-section").hidden = !current.section
  el("video-section").textContent = current.section
  el("video-title").textContent = current.title
  el("prev-btn").disabled = index <= 0
  el("next-btn").disabled = index >= videos.length - 1
  renderCompleteButton()
  renderTime()
}

function renderCompleteButton() {
  el("complete-btn").disabled = current.completed
  el("complete-btn").innerHTML = current.completed ? "Completed &#10003;" : "Complete and Continue &rarr;"
}

function renderTime() {
  const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : current.duration
  el("video-time").textContent = `${formatTime(videoEl.currentTime)} / ${formatTime(duration)}`
}

function renderNotesState() {
  const saved = notesEl.value === (current.notes || "")
  el("save-notes").disabled = saved
  el("save-notes").textContent = saved ? "Notes Saved" : "Save Notes"
}

async function selectVideo(video) {
  flushWatchTime()
  current = video
  lastSavedTime = video.watchTime
  notesEl.value = video.notes || ""
  el("notes-panel").hidden = true
  el("notes-toggle").textContent = "Video Notes"
  renderNotesState()
  renderPlayer()
  renderSidebar()
  await loadSource(video)
}

/** Persist the current playback position if it moved since the last save. */
function flushWatchTime() {
  if (!current || current.completed) return

  const time = Math.floor(videoEl.currentTime || 0)
  if (time > 0 && time !== lastSavedTime) {
    lastSavedTime = time
    current.watchTime = time
    saveProgress({ watchTime: time }).catch((error) => console.error("Failed to save progress:", error))
  }
}

videoEl.addEventListener("loadedmetadata", () => {
  videoEl.playbackRate = playbackRate
  const duration = Math.floor(videoEl.duration)

  if (Number.isFinite(duration) && duration > 0 && current.duration !== duration) {
    current.duration = duration
    saveProgress({ duration }).catch((error) => console.error("Failed to save duration:", error))
    renderSidebar()
  }

  // Resume where we left off, unless the video was already finished.
  if (current.watchTime > 0 && current.watchTime < duration - 1) {
    videoEl.currentTime = current.watchTime
  }
  renderTime()
})

videoEl.addEventListener("timeupdate", () => {
  renderTime()
  if (Math.abs(Math.floor(videoEl.currentTime) - lastSavedTime) >= PROGRESS_INTERVAL_S) {
    flushWatchTime()
  }
})

videoEl.addEventListener("pause", () => {
  flushWatchTime()
  renderSidebar()
})

window.addEventListener("pagehide", flushWatchTime)

async function completeCurrent() {
  const video = current
  const notes = notesEl.value

  try {
    await saveProgress({ completed: true, notes, watchTime: video.duration })
  } catch (error) {
    alert(`Failed to update progress: ${error.message}`)
    return
  }

  Object.assign(video, { completed: true, notes, watchTime: video.duration })
  const index = videos.indexOf(video)

  if (index < videos.length - 1) {
    await selectVideo(videos[index + 1])
    videoEl.play().catch(() => {})
  } else {
    renderPlayer()
    renderSidebar()
  }
}

async function toggleComplete(video) {
  const completed = !video.completed
  const watchTime = completed ? video.duration : 0

  try {
    await requestJson("/api/progress", { method: "POST", body: { videoId: video.id, completed, watchTime } })
  } catch (error) {
    alert(`Failed to update progress: ${error.message}`)
    return
  }

  Object.assign(video, { completed, watchTime })
  if (video === current) {
    lastSavedTime = watchTime
    renderCompleteButton()
  }
  renderSidebar()
}

// ---- Controls ----

el("prev-btn").addEventListener("click", () => selectVideo(videos[videos.indexOf(current) - 1]))
el("next-btn").addEventListener("click", () => selectVideo(videos[videos.indexOf(current) + 1]))
el("complete-btn").addEventListener("click", completeCurrent)

el("fullscreen-btn").addEventListener("click", () => {
  document.fullscreenElement ? document.exitFullscreen() : videoEl.requestFullscreen()
})

for (const speed of SPEEDS) {
  const button = document.createElement("button")
  button.className = "btn btn-outline btn-sm" + (speed === playbackRate ? " selected" : "")
  button.textContent = `${speed}x`
  button.addEventListener("click", () => {
    playbackRate = speed
    videoEl.playbackRate = speed
    el("speed-buttons").querySelectorAll("button").forEach((b) => b.classList.toggle("selected", b === button))
  })
  el("speed-buttons").append(button)
}

el("notes-toggle").addEventListener("click", () => {
  const panel = el("notes-panel")
  panel.hidden = !panel.hidden
  el("notes-toggle").textContent = panel.hidden ? "Video Notes" : "Hide Notes"
})

notesEl.addEventListener("input", renderNotesState)

el("save-notes").addEventListener("click", async () => {
  try {
    await saveProgress({ notes: notesEl.value })
    current.notes = notesEl.value
    renderNotesState()
    renderSidebar()
  } catch (error) {
    alert(`Failed to save notes: ${error.message}`)
  }
})

renderSidebar()
if (current) {
  selectVideo(current)
} else {
  renderPlayer()
}
