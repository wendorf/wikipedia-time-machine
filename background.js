let state = null;

chrome.storage.sync.get({travelDate: '2010-01-01', travelOn: false, travelMachine: "wikipedia"}, function (result) {
  state = result;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.travelDate) {
    state.travelDate = changes.travelDate.newValue;
  }

  if (changes.travelOn) {
    state.travelOn = changes.travelOn.newValue;
  }

  if (changes.travelMachine) {
    state.travelMachine = changes.travelMachine.newValue;
  }
});

let travelMachines = {
  wikipedia: function(details) {
    let url = new URL(details.url);
    if (!url.hostname.match(/^(.+\.|)wikipedia\.org/) || !url.pathname.match(/^\/wiki\//)) {
      return {};
    }

    let article = url.pathname.replace(/^\/wiki\//, "");

    if (article.startsWith("Special:")) {
      return {}
    }

    let timestamp = new Date(state.travelDate).toISOString();
    let queryURL = `https://${url.hostname}/w/api.php?action=query&prop=revisions&format=json&titles=${article}&rvstart=${timestamp}&rvdir=older&rvlimit=1`;

    let data = makeRequest(queryURL);
    let revid = Object.values(data.query.pages)[0].revisions[0].revid;
    return {
      redirectUrl: `https://${url.hostname}/w/index.php?title=${article}&oldid=${revid}`
    };
  },
  wayback: function(details) {
    let timestamp = new Date(state.travelDate).toISOString().replace(/T.*$/, "").replace(/-/g, "");
    let queryURL = `https://archive.org/wayback/available?url=${details.url}&timestamp=${timestamp}`;

    let closest = makeRequest(queryURL).archived_snapshots.closest;

    if (!closest) {
      return {};
    }

    return {
      redirectUrl: closest.url
    };
  }
};

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (!state.travelOn) {
      return {};
    }

    return travelMachines[state.travelMachine](details);
  },
  {
    urls: [
      "<all_urls>"
    ],
    types: ["main_frame"]
  },
  ["blocking"]
);

function makeRequest(queryURL) {
  let request = new XMLHttpRequest();
  request.open('GET', queryURL, false);
  request.send(null);

  return JSON.parse(request.responseText);
}