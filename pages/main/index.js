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
let currentCards = [];
let prevCards = [];
let nextCards = [];

const smallTabletWidth = 586;
const largeTabletWidth = 951;

function PetCard({id, name, img}) {
  this.id = id;
  this.name = name;
  this.img = img;
}

window.addEventListener('load', () => {
  // const cardsNumber = getCardsNumberByWindowSize();
  currentCards = generateCards(3);
  nextCards = generateCards(3);
  prevCards = currentCards;
  renderCards();
});

const getCardsNumberByWindowSize = () => {
  const screenWidth = screen.width;
  if (screenWidth < smallTabletWidth) {
    return 1;
  }
  if (screenWidth < largeTabletWidth) {
    return 2;
  }
  return 3;
}

const generateCards = (cardsNumber) => {
  const currCards = [...currentCards];
  const newCards = [];
  for (let i = 0; i < cardsNumber; i++) {
    let card = getRandomCardFromData(data);
    if (currCards.find(cardObj => cardObj.id === card.id) ||
        newCards.find(cardObj => cardObj.id === card.id)){
      i--;
      continue;
    }
    newCards.push(new PetCard({id: card.id, name: card.name, img: card.img}));
  }
  return newCards;
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

// Slider
const prevButton = document.querySelector('.button.icon_arrow-left');
const nextButton = document.querySelector('.button.icon_arrow-right');

let direction = '';

nextButton.addEventListener('click', () => {
  if (direction === 'left') {
    moveBackward();
  } else {
    moveForward();
  }
  direction = 'right';
  renderCards();
  playUpdateAnimation();
});

prevButton.addEventListener('click', () => {
  if (direction === 'right') {
    moveBackward();
  } else {
    moveForward();
  }
  direction = 'left';
  renderCards();
  playUpdateAnimation();
})

const moveForward = () => {
  prevCards = currentCards;
  currentCards = nextCards;
  nextCards = generateCards(3);
}

const moveBackward = () => {
  const savedState = currentCards;
  currentCards = prevCards;
  prevCards = savedState;
  nextCards = generateCards(3);
}

const playUpdateAnimation = () => {
  const cardsContainer = document.querySelector('.cards-container');
  cardsContainer.classList.add('upd-content');
  setTimeout(() => {
    cardsContainer.classList.remove('upd-content')
  }, 300);
}

// Modal window
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