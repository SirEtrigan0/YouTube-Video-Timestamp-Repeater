document.addEventListener("DOMContentLoaded", function () {
  var startMinutesInput = document.getElementById("start-minutes");
  var startSecondsInput = document.getElementById("start-seconds");
  var endMinutesInput = document.getElementById("end-minutes");
  var endSecondsInput = document.getElementById("end-seconds");
  var errorText = document.getElementById("error-text");

  // Retrieve the stored timestamp values and set them as input values
  var storedStartTime = localStorage.getItem("startTime");
  var storedEndTime = localStorage.getItem("endTime");
  if (storedStartTime) {
    var startTimeParts = storedStartTime.split(":");
    startMinutesInput.value = startTimeParts[0];
    startSecondsInput.value = startTimeParts[1];
  }
  if (storedEndTime) {
    var endTimeParts = storedEndTime.split(":");
    endMinutesInput.value = endTimeParts[0];
    endSecondsInput.value = endTimeParts[1];
  }

  var repeatButton = document.getElementById("repeat-button");

  repeatButton.addEventListener("click", function () {
    var startTime = convertTimeToSeconds(startMinutesInput.value, startSecondsInput.value);
    var endTime = convertTimeToSeconds(endMinutesInput.value, endSecondsInput.value);

    if (isNaN(startTime) || isNaN(endTime)) {
      showError("Invalid time format.");
      return;
    }

    if (endTime < startTime) {
      showError("End time cannot be lower than start time.");
      return;
    }

    // Store the valid timestamp values
    var formattedStartTime = formatSecondsToTime(startTime);
    var formattedEndTime = formatSecondsToTime(endTime);
    localStorage.setItem("startTime", formattedStartTime);
    localStorage.setItem("endTime", formattedEndTime);

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "repeat_video",
        startTime: formattedStartTime,
        endTime: formattedEndTime
      }, function (response) {
        if (chrome.runtime.lastError) {
          showError("Error: " + chrome.runtime.lastError.message);
        } else if (response && response.success) {
          clearError();
        } else if (response && response.error) {
          showError(response.error);
        }
      });
    });
  });

  function convertTimeToSeconds(minutes, seconds) {
    return parseInt(minutes) * 60 + parseInt(seconds);
  }

  function formatSecondsToTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return padZero(minutes) + ":" + padZero(remainingSeconds);
  }

  function padZero(number) {
    return number.toString().padStart(2, "0");
  }

  function showError(errorMessage) {
    errorText.textContent = errorMessage;
    errorText.style.display = "block";
  }

  function clearError() {
    errorText.textContent = "";
    errorText.style.display = "none";
  }
});
