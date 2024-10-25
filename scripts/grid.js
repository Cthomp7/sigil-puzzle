let parentNode;
let sigilSequence;
let backgroundChanged = false;

const desiredSequence = [
  2, 4, 1, 5, 3, 3, 5, 4, 1, 2, 5, 1, 3, 2, 4, 4, 2, 5, 3, 1, 1, 3, 2, 4, 5,
].map(String);

function changeBackgroundImage(color) {
  const gridImg = document.getElementById("grid-image");
  const index = gridImg.src.lastIndexOf("/");
  const path = index !== -1 ? gridImg.src.slice(0, index + 1) : gridImg.src;

  if (color === "original") {
    gridImg.src = `${path}grid.png`;
    backgroundChanged = false;
  } else {
    gridImg.src = `${path}grid-${color}.png`;
    backgroundChanged = true;
  }
}

function checkSequence(tds) {
  let sigilSequence = [];

  tds.forEach((td) => {
    const img = td.querySelector("img");
    if (img) {
      sigilSequence.push(img.dataset.sigil);
    }
  });

  if (sigilSequence.join("") === desiredSequence.join("")) {
    changeBackgroundImage("green");
  } else {
    changeBackgroundImage("red");
  }
}

function checkGrid() {
  const tds = document.querySelectorAll("td");
  const allFilled = Array.from(tds).every(
    (td) => td.querySelector("img") !== null
  );
  if (allFilled) {
    checkSequence(tds);
  }
}

function resetGrid() {
  const tds = document.querySelectorAll("td.droppable");
  tds.forEach((td) => {
    td.innerHTML = "";
  });
}

function allowDrop(event) {
  if (event.target.classList.contains("droppable")) {
    event.preventDefault();
  }
}

function drag(event) {
  const { dataset, src } = event.target;
  event.dataTransfer.setData(
    "text/html",
    JSON.stringify({
      src,
      sigil: dataset.sigil,
    })
  );

  if (event.target.parentNode.classList.contains("droppable")) {
    parentNode = event.target.parentNode;

    const trashIcon = document.getElementById("trashIcon");
    trashIcon.style.display = "block";
  }

  const tds = document.querySelectorAll("td.droppable");
  tds.forEach((td) => {
    td.classList = `${td.classList} .disablePointerEvents`;
  });
}

function drop(event) {
  if (backgroundChanged) changeBackgroundImage("original");

  const trashIcon = document.getElementById("trashIcon");
  trashIcon.style.display = "none";

  if (event.target.classList.contains("trash")) {
    if (parentNode) parentNode.innerHTML = "";
  } else if (event.target.classList.contains("droppable")) {
    event.preventDefault();

    if (parentNode) parentNode.innerHTML = "";

    const data = event.dataTransfer.getData("text/html");
    const { src, sigil } = JSON.parse(data);
    const img = document.createElement("img");

    const attributes = {
      src: src,
      alt: "sigil",
      class: "draggable",
      draggable: true,
    };

    for (let key in attributes) {
      if (key in img) {
        img[key] = attributes[key];
      } else {
        img.setAttribute(key, attributes[key]);
      }
    }
    img.setAttribute("data-sigil", sigil);
    img.ondragstart = (event) => drag(event);

    event.target.innerHTML = "";
    event.target.appendChild(img);
    event.target.classList.remove("hovered");

    checkGrid();
  }

  const tds = document.querySelectorAll("td.droppable");
  tds.forEach((td) => {
    td.classList = "droppable";
  });
}

function dragEnter(event) {
  if (event.target.classList.contains("droppable")) {
    event.target.classList.add("hovered");
  }
}

function dragLeave(event) {
  if (event.target.classList.contains("droppable")) {
    event.target.classList.remove("hovered");
  }
}

window.addEventListener("load", () => {
  document.querySelectorAll(".droppable").forEach((cell) => {
    cell.addEventListener("dragover", allowDrop);
    cell.addEventListener("drop", drop);
    cell.addEventListener("dragenter", dragEnter); // Add hover class
    cell.addEventListener("dragleave", dragLeave); // Remove hover class on leave
  });
});
