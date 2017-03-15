/* global $:true,document:true,_:true*/

// //////////////////////////////////////////////
//    I. UPLOAD IMAGES
// //////////////////////////////////////////////

// Var because I can't figure out how to use let or const here...
var uploadFormData = new FormData();

// Display the last image uploaded
function displayLastSubmission(data) {
  setTimeout(() => {
    $('#upload-console').prepend(`<img src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${data.imageid}.jpg" alt="thumb"/>`);
  }, 10000);
}

// ATTACH IMAGE TO FORM UPLOAD
$('#upload-input').on('change', function generic() {
  const files = $(this).get(0).files;
  if (files.length > 0) {
    // loop through all the selected files
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      // add the files to uploadFormData object for the data payload
      uploadFormData.append('image', file, file.name);
    }
  }
  console.log(uploadFormData);
});

$('#btn-upload-form').click(() => {
  if ($("input[name='tags']").val()) {
    uploadFormData.append('tags', $("input[name='tags']").val());
    // Display the key/value pairs
    for (const pair of uploadFormData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`);
    }
    $.ajax({
      url: '/meme-generator/admin/upload',
      type: 'post',
      data: uploadFormData,
      processData: false,
      contentType: false,
      success: (responseObj) => {
        $('#upload-form').trigger('reset');
        displayLastSubmission(responseObj);
        uploadFormData = new FormData();
      },
    });
  } else {
    console.log('You need to enter some tags for this image.');
  }
});

$('#upload-form').on('submit', (event) => {
  event.preventDefault();
});

// //////////////////////////////////////////////
//    II. CREATE MEME BUILDER
// //////////////////////////////////////////////

// SEARCH FOR BASE IMAGES
$('#btn-create-search').on('click', function generic(event) {
  event.preventDefault();
  const form = $(this);
  let formData = {};
  formData.tags = $("input[name='search-tags']").val().toLowerCase();
  $.ajax({
    url: '/meme-generator/admin/search',
    type: 'POST',
    data: formData,
    success: (responseObj) => {
      console.log('Response:');
      console.log(responseObj);
      displayImageThumbs(responseObj);
      formData = {};
      form.trigger('reset');
    },
  });
});

// SUBMIT FORM TO CREATE BUILDER
$('#btn-create-builder').click((event) => {
  event.preventDefault();
  // Check for empty thumbnails and empty fields...
  const selectedBuilderImages = [];
  $('#page-images img').each(function generic() {
    selectedBuilderImages.push($(this).attr('imageID'));
  });
  let formData = new FormData();
  formData.append('head', $("#builder-inputs input[name='head']").val().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
  formData.append('intro', $("#builder-inputs input[name='intro']").val().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
  formData.append('desk', $("#builder-inputs input[name='desk']").val());
  formData.append('author', $("#builder-inputs input[name='author']").val());
  formData.append('tags', $("#builder-inputs input[name='tags']").val());
  formData.append('images', selectedBuilderImages);

  $.ajax({
    url: '/meme-generator/admin/create-builder',
    type: 'post',
    data: formData,
    processData: false,
    contentType: false,
    success: (responseObj) => {
      console.log(responseObj);
      formData = new FormData();
      $('#page-images').empty();
      $('#builder-inputs input').val('');
      // BuilderURL
      const baseURL = 'http://localhost:4000/meme-generator/builder/';
      const builderLink = `<a href="${baseURL}${responseObj.id}" target="_blank">${baseURL}${responseObj.id}</a>`;
      $('#builder-url').append(builderLink);
    },
  });
});



// //////////////////////////////////////////////
//    DEAL WITH THUMBS
// //////////////////////////////////////////////
// Images AS JPGs!
function displayImageThumbs(data) {
  $('#image-thumbs').empty();
  $.each(data, (k, v) => {
    console.log(v);
    $('#image-thumbs').prepend(`<img class="notSelected" imageID="${v.imageid}" src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${v.imageid}.jpg" alt="thumb"/>`);
  });
  $('#create-builder img').click(function () {
    const thisParent = $(this).parent().attr('id');
    if (thisParent === 'image-thumbs') {
      $(this).appendTo($('#page-images'));
    } else {
      $(this).appendTo($('#image-thumbs'));
    }
  });
}
// Memes as PNGs!
function displayMemeThumbs(data) {
  console.log('in displayMemeThumbs()');
  console.log(data);
  $('#meme-thumbs-moderate').empty();
  $.each(data, (k, v) => {
    console.log(v);
    $('#meme-thumbs-moderate').prepend(`
      <div class='meme-thumb' imageID="${v.date}">
        <div class="reject-button">X</div>
        <img src="https://dmnmemeresized.s3.amazonaws.com/resized-${v.date}.png" alt="thumb"/>
      </div>`);
  });
  $('#create-gallery .meme-thumb:not(.builder-meme) img').click(function () {
    const thisParent = $(this).parent().parent().attr('id');
    if (thisParent === 'meme-thumbs-moderate') {
      $(this).parent().appendTo($('#meme-thumbs-publish'));
      $(this).parent().find('.reject-button').hide();
    } else {
      $(this).parent().appendTo($('#meme-thumbs-moderate'));
      $(this).parent().find('.reject-button').show();
    }
  });
  // Reject the memes
  $('.reject-button').click(function () {
    const memeID = $(this).parent().attr('imageid');
    console.log(memeID);
    $.ajax({
      url: `/meme-generator/admin/delete/memes/${memeID}`,
      type: 'get',
      success: (msg) => {
        console.log(msg);
        $(this).parent().remove();
      },
    });
  });
}


// //////////////////////////////////////////////
//    III CREATE GALLERY PAGE
// //////////////////////////////////////////////

function countMemes() {
  console.log('countMemes');
  $.ajax({
    url: '/meme-generator/admin/count/memes/byBuilder',
    type: 'get',
    success: (memes) => {
      console.log(memes);
      for (const builder of memes) {
        console.log(builder.builder, builder.count);
        console.log(`[data-builderID='${builder.id}']`);
        $(`[data-builderID='${builder.builder}']`).find('.meme-count').text(builder.count);
      }
    },
    error: (err) => {
      console.log(err);
    },
  });
}

function displayBuilders(builders) {
  console.log('displayBuilders');
  return new Promise((resolve, reject) => {
    let count = builders.length;
    console.log(count);
    for (const builder of builders) {
      console.log(builder);
      const html = `
      <div class='builder' data-builderID='${builder.id}'>
        <div class='meme-count'>#</div>
        <img class='builder-meme' src='https://dmnmemeresized.s3.amazonaws.com/resized-${builder.firstMeme[0].date}.png'/>
        <span class='builder-head'>${builder.head}</span>
        <span class='builder-intro'>${builder.intro}</span>
        by <span class='builder-author'>${builder.author}</span>
        for <span class='builder-desk'>${builder.desk}</span>
      </div>
      `;
      $('#filter-builder').prepend(html);
      count -= 1;
      if (count === 0) {
        resolve(true);
      }
    }
    const memeCounts = countMemes();
  });
}

// Click on any of the filter option buttons
$('#create-gallery .btn').click(function generic() {
  // Get the target from the data attr
  const targetID = $(this).data('target');
  console.log(targetID);

  // Depending on the button you clicked
  switch (targetID) {
    // Filter by builder instructions
    case 'filter-builder': {
      $('#filter-builder').empty();
      console.log('SEND AJAX');
      // PROMISE WORK TO BUILD AFTER QUERIES
      $.ajax({
        url: '/meme-generator/admin/search/memes/first',
        type: 'get',
        success: (builders) => {
          displayBuilders(builders).then(() => {
            $('#filter-builder .builder').click(function () {
              const builderID = $(this).data('builderid');
              console.log(builderID);
              $.ajax({
                url: `/meme-generator/admin/search/memes/byBuilder/${builderID}`,
                type: 'get',
                success: (memes) => {
                  displayMemeThumbs(memes);
                },
                error: (err) => {
                  console.log(err);
                },
              });
            });
          });
        },
      });
      break;
    }
    case 'filter-tags': {
      // Get a query of all existing builders
      $.ajax({
        url: '/meme-generator/admin/search/memes/tags',
        type: 'get',
        success: (allTags) => {
          console.log('All memes success');
          console.log(allTags);
          const counts = _.countBy(allTags);
          console.log(counts);
          // Once we get all the memes, lodash this bitch
        },
      });
      // lodash to discover frequency of tags
      // Display tags in order of frequency with click events to query/display memes
      break;
    }
    default: {
      console.log('There was an error in the filter switch');
    }
  }
  $(`#${targetID}`).show();
});

// //////////////////////////////////////
//    IV Publish gallery page
// //////////////////////////////////////
$('#btn-publish').click(() => {
  event.preventDefault();
  console.log('Publishing a gallery page');
  let length = $('#meme-thumbs-publish .meme-thumb').length;
  console.log(length);

  let builderCode = '<div class="meme-container">';

  $('#meme-thumbs-publish .meme-thumb').each(function () {
    let imageID = $(this).attr('imageid');
    const thisEntry = `
      <div class="meme">
        <img src="https://dmnmeme.s3.amazonaws.com/${imageID}.png" width="100%"/>
      </div>
    `;

    builderCode += thisEntry;
  });
  builderCode += '</div>';
  console.log(builderCode);
  $('#gallery-code').text(builderCode);
});

    // length -= 1;
    // console.log(length);
    // if (length === 0) {
    //   console.log(selectedGalleryImages);
    //   const formData = new FormData();
    //   console.log($("#gallery-inputs input[name='head']").val().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
    //   formData.append('head', $("#gallery-inputs input[name='head']").val().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
    //   formData.append('intro', $("#gallery-inputs input[name='intro']").val().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
    //   formData.append('desk', $("#gallery-inputs input[name='desk']").val());
    //   formData.append('author', $("#gallery-inputs input[name='author']").val());
    //   formData.append('tags', $("#gallery-inputs input[name='tags']").val());
    //   formData.append('memes', selectedGalleryImages);
    //   // Display the formData key/value pairs
    //   for (const pair of formData.entries()) {
    //     console.log(`${pair[0]}, ${pair[1]}`);
    //   }
    //   $.ajax({
    //     url: '/meme-generator/admin/create-gallery',
    //     type: 'post',
    //     data: formData,
    //     processData: false,
    //     contentType: false,
    //     success: (responseObj) => {
    //       console.log('Gallery input successful');
    //       console.log(responseObj);
    //       // BuilderURL
    //       const baseURL = 'http://localhost:4000/meme-generator/gallery/';
    //       const galleryLink = `<a href="${baseURL}${responseObj.id}" target="_blank">${baseURL}${responseObj.id}</a>`;
    //       $('#gallery-url').append(galleryLink);
    //     },
    //   });
    // }


// //////////////////////////////////////
// //////////////////////////////////////
//    DOCUMENT READY
// //////////////////////////////////////
// //////////////////////////////////////

$(document).ready(() => {
  let currentDestination = 'choose-theme';
  // //////////////////////////////////////
  //    ADMIN NAV BUTTON
  // //////////////////////////////////////
  $('.nav-button').click(function generic() {
    // Turn on/off nav buttons
    $(`#${currentDestination}`).hide();
    currentDestination = $(this).data('destination');
    $(`#${currentDestination}`).show();
    $('.nav-button').removeClass('active-nav');
    $(this).addClass('active-nav');
  });

  $('.theme').click(() => {
    $('.sideNav #upload-image').slideDown();
  });
});
