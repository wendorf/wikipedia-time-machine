let state = null;
let elements = null;

document.addEventListener('DOMContentLoaded', () => {
  elements = {
    travelOn: document.getElementById('travel-on'),
    travelDate: document.getElementById('travel-date'),
    travelDateRow: document.getElementById('travel-date-row')
  };

  chrome.storage.sync.get({travelDate: '2010-01-01', travelOn: false}, function (result) {
    state = result;
    syncUI();
  });

  elements.travelDate.addEventListener('change', () => {
    syncState();
  });

  elements.travelOn.addEventListener('change', () => {
    syncState();
    syncUI();
  });
});

function syncState() {
  state = {
    travelDate: elements.travelDate.value,
    travelOn: elements.travelOn.checked
  };
  chrome.storage.sync.set(state);
}

function syncUI() {
  elements.travelOn.checked = state.travelOn;

  elements.travelDate.value = state.travelDate;
  elements.travelDate.disabled = !state.travelOn;

  if (state.travelOn) {
    elements.travelDateRow.classList.remove("disabled");
  } else {
    elements.travelDateRow.classList.add("disabled");
  }
}
