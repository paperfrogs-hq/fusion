// Forms input and output section

const scriptURL =
  "https://script.google.com/macros/s/AKfycbyZftqcbofl_Wmr6jPagevo-p75S8UZypcCYBB2xFSLV0yMhHsBeqsTnQvxFSRQTRhVHQ/exec";
const form = document.forms["submit-to-google-sheet"];
const msg = document.getElementById("Ara-Ara-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHTML = "Thanks For Subscribing";
      setTimeout(function () {
        msg.innerHTML = "";
      }, 5000);
      form.reset();
    })
    .catch((error) => console.error("Error!", error.message));
});
