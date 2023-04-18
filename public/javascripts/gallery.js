const templates = {};
let slides;
let photos;
let photoDetailsHeader;
let commentsUL;

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

function displayPhotoDetails(photo){
  photoDetailsHeader.insertAdjacentHTML(`beforeend`, templates.photo_information(photo))
}

function updatePhotoDetails(photo){
  photoDetailsHeader.innerHTML = '';
  displayPhotoDetails(photo);
}

async function displayComments(photoId){
  const response = await fetch(`/comments?photo_id=${photoId}`);
  const comments = await response.json();
  commentsUL.insertAdjacentHTML(`beforeend`, templates.photo_comments({comments}));
}

async function updateComments(photoId){
  commentsUL.innerHTML='';
  await displayComments(photoId);
}

async function populatePageData(){
  const photo = photos[0];
  const photoId = photo.id;
  getTemplates();
  populateSlides();
  displayPhotoDetails(photo);
  await displayComments(photoId);
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
  const photo = photos.find(p=>p.id === photoId);
  updatePhotoDetails(photo);
  await updateComments(photoId);
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
  
  prevAnchor.addEventListener('click', async (e)=>{
    e.preventDefault();
    await moveActiveBackwards();

  })
  nextAnchor.addEventListener('click', async (e)=>{
    e.preventDefault();
    await moveActiveForward();
  })
  
})