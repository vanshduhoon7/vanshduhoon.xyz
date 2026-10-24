
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

/* Animate sections as they enter the viewport */
const revealElements = document.querySelectorAll(
  ".section, .project-card, .journey-list > div"
);

revealElements.forEach((element) => {
  element.classList.add("reveal");
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}
