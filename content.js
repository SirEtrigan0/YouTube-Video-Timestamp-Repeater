var video = null;
var startTime = 0;
var endTime = Infinity;

function repeatVideo() {
  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
  } else if (video.currentTime < startTime) {
    video.currentTime = startTime;
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "repeat_video") {
    video = document.querySelector("video");
    if (video) {
      var videoDuration = video.duration;
      if (videoDuration < message.endTime) {
        sendResponse({ success: false, error: "The video is shorter than the specified end time." });
        return;
      }

      startTime = convertTimestampToSeconds(message.startTime);
      endTime = convertTimestampToSeconds(message.endTime);

      video.currentTime = startTime;
      video.play();
      video.addEventListener("timeupdate", repeatVideo);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "No video found." });
    }
  }
  return true; // Keep the message channel open for asynchronous response
});

function convertTimestampToSeconds(timestamp) {
  var parts = timestamp.split(":");
  var minutes = parseInt(parts[0]);
  var seconds = parseInt(parts[1]);
  return minutes * 60 + seconds;
}
