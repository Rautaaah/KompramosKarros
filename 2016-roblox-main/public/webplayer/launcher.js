(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function getStorageValue(key, fallbackValue) {
    try {
      var value = window.localStorage.getItem(key);
      return value === null || value === undefined ? fallbackValue : value;
    } catch (e) {
      return fallbackValue;
    }
  }

  function setStorageValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  }

  function parseJoinScript(argsText, placeId) {
    if (!argsText || typeof argsText !== "string") return null;

    var joinMatch = argsText.match(/-j\s+"([^"]+)"/);
    if (joinMatch && joinMatch[1]) return joinMatch[1];

    var ticketMatch = argsText.match(/ticket=([^&"']+)/);
    if (!ticketMatch || !ticketMatch[1]) return null;

    return window.location.origin + "/game/PlaceLauncher.ashx?placeid=" + encodeURIComponent(placeId) + "&ticket=" + encodeURIComponent(ticketMatch[1]);
  }

  function normalizeUrl(url) {
    if (!url) return null;
    if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) return url;
    return window.location.origin + (url.charAt(0) === "/" ? url : "/" + url);
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function loadPlaceLauncherUrl(placeId) {
    var response = await fetch("/game/get-join-script?placeId=" + encodeURIComponent(placeId), {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Join endpoint failed (" + response.status + ").");
    }
    var argsText = await response.text();
    var placeLauncherUrl = parseJoinScript(argsText, placeId);
    if (!placeLauncherUrl) {
      throw new Error("Join args format was invalid.");
    }
    return placeLauncherUrl;
  }

  async function resolveFinalJoinScriptUrl(placeLauncherUrl, onStatus) {
    var maxAttempts = 30;
    for (var attempt = 1; attempt <= maxAttempts; attempt++) {
      if (onStatus) onStatus("Starting server (" + attempt + "/" + maxAttempts + ")...");
      var response = await fetch(placeLauncherUrl, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("PlaceLauncher failed (" + response.status + ").");
      }

      var text = await response.text();
      var payload = null;
      try {
        payload = JSON.parse(text);
      } catch (e) {}

      if (payload && payload.joinScriptUrl) {
        return normalizeUrl(payload.joinScriptUrl);
      }

      // fallbacks if payload shape changes
      if (payload && typeof payload.message === "string") {
        var msg = payload.message.toLowerCase();
        if (msg.indexOf("can not access this place") !== -1) {
          throw new Error(payload.message);
        }
      }

      // Some builds return "Waiting for server" before a joinScriptUrl is ready.
      await sleep(1000);
    }

    throw new Error("Server did not become ready in time.");
  }

  function loadRuntime(Module) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "/webplayer/WebPlayer.js";
      script.async = true;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Failed to load /webplayer/WebPlayer.js"));
      };
      document.body.appendChild(script);
    });
  }

  function setStatus(text, isError) {
    var status = $("status");
    if (!status) return;
    status.textContent = text || "";
    if (isError) {
      status.classList.add("err");
    } else {
      status.classList.remove("err");
    }
  }

  function detectTouchDefault() {
    return (("ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) ? "true" : "false";
  }

  function init() {
    var yearSelect = $("yearSelect");
    var touchSelect = $("touchSelect");
    var msaaSelect = $("msaaSelect");
    var startButton = $("startButton");

    touchSelect.value = getStorageValue("rbx_touch_controls", detectTouchDefault());
    msaaSelect.value = getStorageValue("rbx_msaa", "8");
    yearSelect.value = getStorageValue("rbx_year_selection", "2016");

    startButton.addEventListener("click", async function (e) {
      e.preventDefault();
      startButton.disabled = true;
      setStatus("Starting web player...", false);

      try {
        var placeId = getQueryParam("placeId") || getQueryParam("placeid") || getQueryParam("placeIdd");
        if (!placeId) {
          throw new Error("Missing ?placeId= in URL.");
        }

        setStorageValue("rbx_touch_controls", touchSelect.value);
        setStorageValue("rbx_msaa", msaaSelect.value);
        setStorageValue("rbx_year_selection", yearSelect.value);

        setStatus("Getting join ticket...", false);
        var placeLauncherUrl = await loadPlaceLauncherUrl(placeId);
        var joinScriptUrl = await resolveFinalJoinScriptUrl(placeLauncherUrl, function (message) {
          setStatus(message, false);
        });
        setStatus("Server ready. Loading runtime...", false);

        var Module = {
          canvas: null,
          joinScript: joinScriptUrl,
          yearSelection: yearSelect.value,
          touchEnabled: touchSelect.value === "true",
          onRuntimeInitialized: function () {
            setStatus("", false);
          },
        };
        window.RBXModule = Module;

        var canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.oncontextmenu = function (evt) {
          evt.preventDefault();
        };
        document.body.appendChild(canvas);
        Module.canvas = canvas;

        var launcher = $("launcher");
        if (launcher) launcher.remove();

        await loadRuntime(Module);
      } catch (err) {
        console.error(err);
        setStatus("Unable to start game: " + (err && err.message ? err.message : String(err)), true);
        startButton.disabled = false;
      }
    });
  }

  window.addEventListener("error", function (event) {
    if (!event) return;
    setStatus("Runtime error: " + (event.message || "unknown error"), true);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
