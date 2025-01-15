import data from '../../pets.json' with {type: 'json'};

const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const links = document.querySelectorAll('.nav-list__link');

burger.addEventListener('click', () => {
  toggleBurger();
  toggleMenu();
  toggleOverlay();
})

links.forEach(link => {
  link.addEventListener('click', () => {
    toggleBurger();
    toggleMenu();
    toggleOverlay();
  })
})


const toggleMenu = () => {
  menu.classList.toggle('active');
  if (menu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.removeProperty('overflow');
  }
}

const toggleBurger = () => {
  burger.classList.toggle('active');
}

const toggleOverlay = () => {
  const overlay = document.querySelector('.overlay');
  if (!overlay) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.append(overlay);

    overlay.addEventListener('click', () => {
      toggleBurger();
      toggleMenu();
      toggleOverlay();
    })
  } else {
    document.body.removeChild(overlay);
  }
}

// Pet cards generation
let dataArray = [];
let dataSplittedOnPages = [];
let currentCards = [];

const dataSize = 48;
const smallTabletWidth = 586;
const largeTabletWidth = 921;

function PetCard({id, name, img}) {
  this.id = id;
  this.name = name;
  this.img = img;
}

window.addEventListener('load', () => {
  generateAndRenderContent();
});

window.addEventListener('resize', debounce(() => {
  updateContentOnResize();
}, 200));

function debounce(func, timeout) {
  let timer;
  return function() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, timeout);
  }
};

const generateAndRenderContent = () => {
  dataArray = generateDataArray(dataSize);
  dataSplittedOnPages = splitDataArrayOnPages(dataArray);
  currentCards = dataSplittedOnPages[0];
  renderCards();
  renderPageNumber();
}

const updateContentOnResize = () => {
  const currentPageOfTotal = currentPage / dataSplittedOnPages.length;
  dataSplittedOnPages = splitDataArrayOnPages(dataArray);
  currentPage = Math.round(dataSplittedOnPages.length * currentPageOfTotal);
  currentCards = dataSplittedOnPages[currentPage - 1];
  renderCards();
  renderPageNumber();
}

const generateDataArray = (dataSize) => {
  const dataArr = [];
  const cardsNumberOnPage = getCardsNumberByWindowSize();
  const pages = getNumberPages(dataSize, cardsNumberOnPage);
  for (let i = 0; i < pages; i++) {
    dataArr.push(...generateCards(cardsNumberOnPage));
  }
  return dataArr;
}

const splitDataArrayOnPages = (dataArray) => {
  const splittedArray = [];
  const cardsNumberOnPage = getCardsNumberByWindowSize();
  const pages = getNumberPages(dataSize, cardsNumberOnPage);
  for (let i = 0; i < pages; i++) {
    splittedArray.push(dataArray.slice(i * cardsNumberOnPage, i * cardsNumberOnPage + cardsNumberOnPage));
  }
  return splittedArray;
}

const getCardsNumberByWindowSize = () => {
  const screenWidth = screen.width;
  if (screenWidth < smallTabletWidth) {
    return 3;
  }
  if (screenWidth < largeTabletWidth) {
    return 6;
  }
  return 8;
}

const generateCards = (cardsNumber) => {
  const cards = []
  for (let i = 0; i < cardsNumber; i++) {
    let card = getRandomCardFromData(data);
    if (cards.find(cardObj => cardObj.id === card.id)){
      i--;
      continue;
    }
    cards.push(new PetCard({id: card.id, name: card.name, img: card.img}));
  }
  return cards;
}

const getRandomCardFromData = (data) => {
  const dataLength = data.length;
  const randomNumber = Math.floor(Math.random() * dataLength);
  return data[randomNumber]
}

const buildCard = (card) => {
  const cardNode = document.createElement('div');
  cardNode.className = 'card';
  cardNode.setAttribute('data-id', card.id);
  const template = `
    <img src="${card.img}" class="card__image" alt="${card.name}">
    <div class="card__content">
      <h4 class="card__name">${card.name}</h4>
      <button class="button button_bordered">Learn more</button>
    </div>`
    cardNode.innerHTML = template;
  return cardNode;
}

const clickPetCardHandler = () => {
  const petCard = document.querySelectorAll('.card');
  petCard.forEach(card => {
    card.addEventListener('click', (e) => {
      const clickedCardId = e.currentTarget.getAttribute('data-id');
      const petData = getPetDataById(clickedCardId);
      const modal = new PetsModal(petData);
      modal.openModal();
      addClickEventsOnModal(modal);
    })
  })
}

const renderCards = () => {
  const cardsContainer = document.querySelector('.cards-container');

  cardsContainer.innerHTML = '';
  currentCards.forEach(card => {
    const cardNode = buildCard(card);
    cardsContainer.append(cardNode);
  })
  clickPetCardHandler();
}

const renderPageNumber = () => {
  const pageNumber = document.querySelector('.page-number');
  pageNumber.innerHTML = `${currentPage}`;

  if (currentPage === 1) {
    setButtonsDisabled(prevPageButton, toFirstPageButton);
    setButtonsActive(nextPageButton, toEndPageButton);
  }

  if (currentPage === dataSplittedOnPages.length) {
    setButtonsDisabled(nextPageButton, toEndPageButton);
    setButtonsActive(prevPageButton, toFirstPageButton);
  }
}

// Pagination
const toFirstPageButton = document.querySelector('.to-first');
const prevPageButton = document.querySelector('.prev-page');
const nextPageButton = document.querySelector('.next-page');
const toEndPageButton = document.querySelector('.to-end');

let currentPage = 1;

const getNumberPages = (dataSize, elementsOnPage) => {
  return Math.ceil(dataSize / elementsOnPage);
}

const setButtonsActive = (...buttons) => {
  for (let button of buttons) {
    button.removeAttribute('disabled');
  }
}

const setButtonsDisabled = (...buttons) => {
  for (let button of buttons) {
    button.setAttribute('disabled', 'true');
  }
}

toFirstPageButton.addEventListener('click', () => {
  currentPage = 1;
  currentCards = dataSplittedOnPages[currentPage - 1];

  renderPageNumber();
  renderCards();
  playUpdateAnimation();
})

prevPageButton.addEventListener('click', () => {
  if (currentPage - 1 > 0) {
    currentPage--;
    setButtonsActive(nextPageButton, toEndPageButton);
  }
  currentCards = dataSplittedOnPages[currentPage - 1];
  renderPageNumber();
  renderCards();
  playUpdateAnimation();
});

nextPageButton.addEventListener('click', () => {
  if (currentPage + 1 <= dataSplittedOnPages.length) {
    currentPage++;
    setButtonsActive(prevPageButton, toFirstPageButton);
  }
  currentCards = dataSplittedOnPages[currentPage - 1];
  renderPageNumber();
  renderCards();
  playUpdateAnimation();
});

toEndPageButton.addEventListener('click', () => {
  currentPage = dataSplittedOnPages.length;
  currentCards = dataSplittedOnPages[currentPage - 1];

  renderPageNumber();
  renderCards();
  playUpdateAnimation();
})

const playUpdateAnimation = () => {
  const cardsContainer = document.querySelector('.cards-container');
  cardsContainer.classList.add('upd-content');
  setTimeout(() => {
    cardsContainer.classList.remove('upd-content')
  }, 300);
}
// Modal

const getPetDataById = (id) => {
  return data.find(pet => pet.id === id);
}

const addClickEventsOnModal = (modal) => {
  const overlay = document.querySelector('.overlay');
  overlay.addEventListener('click', modal.closeModal);
}

function PetsModal({id, name, img, type, breed, description, age, inoculations, diseases, parasites}) {
  this.id = id;
  this.name = name;
  this.img = img;
  this.type = type;
  this.breed = breed;
  this.description = description;
  this.age = age;
  this.inoculations = inoculations;
  this.diseases = diseases;
  this.parasites = parasites;

  this.createModalWindow = function() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const modal = document.createElement('div');
    modal.className = `modal-window pet-modal`;
    
    const template = `
    <button class="button button_close modal-window__button"></button>
    <div class="pet-modal__image">
      <img src="${this.img}" alt="${this.name}">
    </div>
    <div class="pet-modal__content">
      <h3 class="pet-modal__name">${this.name}</h3>
      <h4 class="pet-modal__type">${this.type} - ${this.breed}</h4>
      <h5 class="pet-modal__description">${this.description}</h5>
      <ul class="pet-modal__info">
        <li><span class="pet-modal__feature">Age:</span> ${this.age}</li>
        <li><span class="pet-modal__feature">Inoculations:</span> ${this.inoculations.join(',')}</li>
        <li><span class="pet-modal__feature">Diseases:</span> ${this.diseases.join(',')}</li>
        <li><span class="pet-modal__feature">Parasites:</span> ${this.parasites.join(',')}</li>
      </ul>
    </div>`

    modal.innerHTML = template;
    overlay.append(modal);
    return overlay;
  }

  this.openModal = function() {
    const modal = this.createModalWindow();
    document.body.append(modal);
    document.body.style.overflow = 'hidden';
  }

  this.closeModal = function(e) {
    const eventTarget = e.target
    if (eventTarget.classList.contains('overlay') || eventTarget.classList.contains('modal-window__button')) {
      const overlay = document.querySelector('.overlay');
      overlay.remove();
      document.body.style.removeProperty('overflow');
    }
  }
}