const templates = {};
let slides;
let photos;
let photoDetailsHeader;
let commentsUL;
let activePhoto;

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function getPhotos(){
  const responsePhotos = await fetch("/photos");
  photos = await responsePhotos.json();
} 

function getTemplates(){
  document.querySelectorAll("script[type='text/x-handlebars']").forEach(template => {
    templates[template.id] = Handlebars.compile(template.innerHTML);
  });
  document.querySelectorAll("[data-type=partial]").forEach(template => {
    Handlebars.registerPartial(template.id, template.innerHTML);
  });
}

function populateSlides(){
  slides.insertAdjacentHTML(`beforeend`, templates.photos({photos: photos}));
}

function addLikesEventListener(){
  const likes = document.querySelector('a.like');
  likes.addEventListener('click', (e) => {
    e.preventDefault();
    postData("/photos/like", { photo_id: activePhoto.id }).then((data) => {
      activePhoto.likes = data.total;
      likes.textContent = `♡
  ${data.total}
  Likes`;
    });
  });
}

function addFavoritesEventListener(){
  const favorites = document.querySelector('a.favorite');
  favorites.addEventListener('click', (e) => {
    e.preventDefault();
    postData("/photos/favorite", { photo_id: activePhoto.id }).then((data) => {
      activePhoto.favorites = data.total;
      favorites.textContent = `☆
  ${data.total}
  Favorites`;
    });
  });  
}

function displayPhotoDetails(){
  photoDetailsHeader.insertAdjacentHTML(`beforeend`, templates.photo_information(activePhoto))
  addLikesEventListener();
  addFavoritesEventListener();
}

function updatePhotoDetails(){
  photoDetailsHeader.innerHTML = '';
  displayPhotoDetails(activePhoto);
}

async function displayComments(){
  const response = await fetch(`/comments?photo_id=${activePhoto.id}`);
  const comments = await response.json();
  commentsUL.insertAdjacentHTML(`beforeend`, templates.photo_comments({comments}));
}

async function updateComments(){
  commentsUL.innerHTML='';
  await displayComments(activePhoto.id);
}

async function populatePageData(){
  activePhoto = photos[0];
  getTemplates();
  populateSlides();
  displayPhotoDetails();
  await displayComments();
}

function getActive(){
  return slides.querySelector('figure.active')
}

async function moveActiveForward(){
  let active = getActive();
  let nextActive;
  if(!active){
    active = slides.children[0];
    nextActive = slides.children[1];
  }else{
    nextActive = active.nextElementSibling;
    if(!nextActive) nextActive = slides.children[0];
  }
  await changeSlide(active, nextActive);
}

async function moveActiveBackwards(){
  let active = getActive();
  let nextActive;
  if(!active){
    active = slides.children[0];
    nextActive = slides.lastElementChild;
  }else{
    nextActive = active.previousElementSibling;
    if(!nextActive) nextActive = slides.lastElementChild;
  }
  await changeSlide(active, nextActive);
}

async function changeSlide(active, nextActive){
  active.classList.remove('active');
  $(active).fadeOut(300);
  nextActive.classList.add('active');
  $(nextActive).delay(300).fadeIn(300);
   
  const photoId = Number(nextActive.getAttribute('data-id'));
  activePhoto = photos.find(p=>p.id === photoId);
  updatePhotoDetails();
  await updateComments();
}



document.addEventListener('DOMContentLoaded', async ()=>{
  console.log('document loaded...');
  slides = document.querySelector('#slides');
  photoDetailsHeader = document.querySelector('section>header');
  commentsUL = document.querySelector('#comments ul');

  const prevAnchor = document.querySelector('a.prev');
  const nextAnchor = document.querySelector('a.next');
  
  await getPhotos();
  await populatePageData();

  const commentForm = document.querySelector('form');
  
  prevAnchor.addEventListener('click', async (e)=>{
    e.preventDefault();
    await moveActiveBackwards();

  })
  nextAnchor.addEventListener('click', async (e)=>{
    e.preventDefault();
    await moveActiveForward();
  })

  commentForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    console.log('submitted');
  })
  
})