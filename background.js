let state = null;

chrome.storage.sync.get({travelDate: '2010-01-01', travelOn: false}, function (result) {
  state = result;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.travelDate) {
    state.travelDate = changes.travelDate.newValue;
  }

  if (changes.travelOn) {
    state.travelOn = changes.travelOn.newValue;
  }
});

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (!state.travelOn) {
      return {};
    }

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
    let request = new XMLHttpRequest();
    request.open('GET', queryURL, false);
    request.send(null);

    let data = JSON.parse(request.responseText);
    let revid = Object.values(data.query.pages)[0].revisions[0].revid;
    return {
      redirectUrl: `https://${url.hostname}/w/index.php?title=${article}&oldid=${revid}`
    };
  },
  {
    urls: [
      "*://*.wikipedia.org/wiki/*"
    ],
    types: ["main_frame"]
  },
  ["blocking"]
);