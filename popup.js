let state = null;
let elements = null;

document.addEventListener('DOMContentLoaded', () => {
  elements = {
    travelOn: document.getElementById('travel-on'),
    travelDate: document.getElementById('travel-date'),
    travelMachine: document.getElementById('travel-machine'),
  };

  chrome.storage.sync.get({travelDate: '2010-01-01', travelOn: false, travelMachine: "wikipedia"}, function (result) {
    state = result;
    syncUI();
  });

  elements.travelOn.addEventListener('change', () => {
    syncState();
    syncUI();
  });

  elements.travelDate.addEventListener('change', () => {
    syncState();
  });

  elements.travelMachine.addEventListener('change', () => {
    syncState();
  })
});

function syncState() {
  state = {
    travelDate: elements.travelDate.value,
    travelOn: elements.travelOn.checked,
    travelMachine: elements.travelMachine.options[elements.travelMachine.options.selectedIndex].value
  };
  chrome.storage.sync.set(state);
}

function syncUI() {
  elements.travelOn.checked = state.travelOn;

  elements.travelDate.value = state.travelDate;
  elements.travelDate.disabled = !state.travelOn;

  elements.travelMachine.disabled = !state.travelOn;

  Array.from(document.getElementsByClassName('travel-row')).forEach((row) => {
    if (state.travelOn) {
      row.classList.remove("disabled");
    } else {
      row.classList.add("disabled");
    }
  });

  Array.from(elements.travelMachine.options).find((o) => o.value === state.travelMachine).selected = true
}
