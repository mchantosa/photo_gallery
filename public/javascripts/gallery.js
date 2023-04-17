document.addEventListener('DOMContentLoaded', async ()=>{
  console.log('document loaded...')
  const templates = {};
  const slides = document.querySelector('#slides')
  const photoData = document.querySelector('section>header')
  const commentsList = document.querySelector('#comments ul')
  let photoId;
  
  const responsePhotos = await fetch("/photos");
  const photos = await responsePhotos.json();
  photoId = photos[0].id;

  const responseComments = await fetch(`/comments?photo_id=${photoId}`);
  const comments = await responseComments.json();

  
  document.querySelectorAll("script[type='text/x-handlebars']").forEach(template => {
    templates[template.id] = Handlebars.compile(template.innerHTML);
  });
  document.querySelectorAll("[data-type=partial]").forEach(template => {
    Handlebars.registerPartial(template.id, template.innerHTML);
  });

  console.log(comments)
  slides.insertAdjacentHTML(`beforeend`, templates.photos({photos: photos}));
  photoData.insertAdjacentHTML(`beforeend`, templates.photo_information(photos[photoId]))
  commentsList.insertAdjacentHTML(`beforeend`, templates.photo_comments({comments: comments}));
  

  
})