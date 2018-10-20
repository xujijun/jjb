document.getElementById("login").addEventListener("click", function () {
  chrome.runtime.sendMessage({
    text: "openLogin",
  }, function(response) {
    console.log("Response: ", response);
  });
})
