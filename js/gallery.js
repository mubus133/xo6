// gallery.js — lightweight gallery loader & modal viewer
async function fetchJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Fetch failed: '+res.status);
  return res.json();
}

async function loadGalleryPreview(limit = 3){
  try {
    const data = await fetchJSON('data/gallery.json');
    const preview = document.getElementById('gallery-preview');
    if(!preview) return;
    preview.innerHTML = '';
    data.slice(0, limit).forEach(item => {
      const col = document.createElement('div'); col.className = 'col-12 col-sm-6 col-md-4';
      const card = document.createElement('div'); card.className = 'card border-0 shadow-sm';
      const mediaWrapper = document.createElement('div'); mediaWrapper.className = 'ratio ratio-4x3 overflow-hidden';
      if(item.mediaType === 'video'){
        mediaWrapper.innerHTML = `<video muted playsinline preload="metadata" poster="${item.poster || ''}" src="${item.src}"></video>`;
      } else {
        mediaWrapper.innerHTML = `<img loading="lazy" src="${item.src}" alt="${item.caption || item.user}" />`;
      }
      card.appendChild(mediaWrapper);
      const body = document.createElement('div'); body.className = 'card-body';
      body.innerHTML = `<h6 class="mb-1">${item.user}</h6><p class="small text-muted mb-0">${item.caption || ''}</p>`;
      card.appendChild(body);
      card.tabIndex = 0;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openMediaModal(item));
      card.addEventListener('keypress', (e) => { if(e.key === 'Enter') openMediaModal(item); });
      col.appendChild(card); preview.appendChild(col);
    });
  } catch(err) {
    console.error(err);
  }
}

function openMediaModal(item){
  const container = document.getElementById('mediaContainer');
  container.innerHTML = '';
  if(item.mediaType === 'video'){
    container.innerHTML = `<video controls class="w-100 h-100" autoplay><source src="${item.src}" type="video/mp4">Your browser does not support the video tag.</video>`;
  } else {
    container.innerHTML = `<img src="${item.src}" alt="${item.caption}" class="img-fluid rounded">`;
  }
  const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
  modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPreview(3);
});
