
const phrases = [
  "learning web security",
  "building useful projects",
  "solving CTF challenges",
  "understanding how things work"
];

const output = document.querySelector("#typed");
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
  const phrase = phrases[phraseIndex];

  output.textContent = phrase.slice(0, charIndex);

  if (!deleting && charIndex < phrase.length) {
    charIndex++;
    setTimeout(type, 75);
  } else if (!deleting) {
    deleting = true;
    setTimeout(type, 1300);
  } else if (charIndex > 0) {
    charIndex--;
    setTimeout(type, 35);
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(type, 350);
  }
}

type();

document.querySelector("#year").textContent =
  new Date().getFullYear();
