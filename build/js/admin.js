/* global $:true,document:true,_:true*/
Rainbow.defer = true;

// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    I. UPLOAD IMAGES
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

// Var because I can't figure out how to use let or const here...
var uploadFormData = new FormData();

// Display the last image uploaded
function displayLastSubmissions(data) {
  data.forEach((image) => {
    const timer = setInterval(() => {
      $.get(`https://dmnmemebaseresized.s3.amazonaws.com/resized-${image}.jpg`)
        .done(() => {
          console.log(`${image} loaded.`);
          $('#upload-console').prepend(`
            <div class='console-thumb'>
            <img src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${image}.jpg" alt="thumb"/>
            </div>`);
          clearInterval(timer);
        }).fail(() => {
          console.log('FAILED image load');
        });
    }, 1000);
  });
}

function logFormData(form) {
  console.log('LOGGING FORM DATA');
  // Display the key/value pairs
  for (const pair of form.entries()) {
    console.log(pair[0]);
    console.log(pair[1]);
  }
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
  logFormData(uploadFormData);
});

$('#btn-upload-form').click(() => {
  if ($("input[name='tags']").val()) {
    uploadFormData.append('tags', $("input[name='tags']").val());
    logFormData(uploadFormData);
    $.ajax({
      url: '/meme-generator/admin/upload',
      type: 'post',
      data: uploadFormData,
      processData: false,
      contentType: false,
      error: (responseObj) => {
        console.log('ERROR', responseObj);
        $('#upload-form').trigger('reset');
        uploadFormData = new FormData();
      },
      success: (responseObj) => {
        console.log('SUCCESS', responseObj);
        displayLastSubmissions(responseObj);
        $('#upload-form').trigger('reset');
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





// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    II. CREATE MEME BUILDER
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

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

// VALIDATE BUILDER INPUTS
function validate(thisDiv) {
  if (thisDiv.hasClass('optional')) {
    console.log('optional');
  } else {
    console.log(thisDiv.val());
    if (thisDiv.val().length) {
      thisDiv.addClass('completed');
      thisDiv.removeClass('required');
    } else {
      thisDiv.addClass('required');
      thisDiv.removeClass('completed');
    }
  }
}

function replaceHashtags(str) {
  return str.replace(/#+/g, '%23');
}
function replaceMentions(str) {
  return str.replace(/@+/g, '%40');
}
function stripMentions(str) {
  return str.replace(/@+/g, '');
}


// COUNT HEADLINE CHARACTERS FOR TWEET
var headTooLong = false;
$('.char-remaining').text(140 - 88);

function checkAllLengths(){
  const maxTwitterCharacters = 140;
  const urlLength = 23; // Takes into account Twitter's shortner
  const mandatory = urlLength;
  const hashtagLength = $("#builder-inputs input[name='hashtag']").val().length;
  const mentionLength = $("#builder-inputs input[name='mention']").val().length;
  const sectionLength = $("#builder-inputs input[name='twitter']").val().length;
  const headLength = $('#head-input').val().length;
  const charactersTaken = mandatory + hashtagLength + mentionLength + headLength + sectionLength;
  const warningLength = maxTwitterCharacters - 10;
  const alertLength = maxTwitterCharacters - 5;
  $('.char-remaining').text(maxTwitterCharacters - charactersTaken);
  if (charactersTaken < warningLength) {
    $('#head-input').removeClass('lengthAlert');
    $('#head-input').removeClass('lengthWarning');
    headTooLong = false;
  }
  if (charactersTaken > warningLength && charactersTaken <= alertLength) {
    $('#head-input').removeClass('lengthAlert');
    $('#head-input').addClass('lengthWarning');
    headTooLong = false;
  }
  if (charactersTaken > maxTwitterCharacters) {
    $('#head-input').removeClass('lengthWarning');
    $('#head-input').addClass('lengthAlert');
    headTooLong = true;
  }
}

$('#builder-inputs input').on('keyup', function() {
  if ($(this).hasClass('optional')) {
    checkAllLengths();
  } else if ($(this).attr('id') === 'head-input') {
    validate($(this));
    checkAllLengths();
  } else if ($(this).attr('id') === 'section-input') {
    validate($(this));
    checkAllLengths();
  } else {
    validate($(this));
  }
});

// $('#builder-inputs .optional').on('keyup', () => {
//   checkAllLengths();
// });
//
// $('#builder-inputs .required').on('keyup', function () {
//   validate($(this));
// });
// $('#head-input').on('keyup', () => {
//   checkAllLengths();
// });
//

// SUBMIT FORM TO CREATE BUILDER
$('#btn-create-builder').click((event) => {
  if (!headTooLong){
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
    formData.append('twitter', stripMentions($("#builder-inputs input[name='twitter']").val()));
    formData.append('hashtag', replaceHashtags($("#builder-inputs input[name='hashtag']").val()));
    formData.append('mention', replaceMentions($("#builder-inputs input[name='mention']").val()));
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
        const baseURL = 'http://apps.dallasnews.com/meme-generator/builder/';
        const builderLink = `<a href="${baseURL}${responseObj.id}" target="_blank">${baseURL}${responseObj.id}</a>`;
        $('#builder-url').append(builderLink);
        alert('Remember, the first dank meme is your responsibility.');
      },
    });
  } else {
    alert("You're headline is too long.");
  }
});


// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    DEAL WITH THUMBS
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
// Images AS JPGs!
function displayImageThumbs(data) {
  $('#image-thumbs').empty();
  $.each(data, (k, v) => {
    console.log(v);
    $('#image-thumbs').prepend(`
      <div class='console-thumb'>
        <img imageID="${v.imageid}" src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${v.imageid}.jpg" alt="thumb"/>
      </div>`);
  });
  $('#create-builder .console-thumb').click(function () {
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
        <img src="https://dmnmeme.s3.amazonaws.com/${v.date}.png" alt="full" width="100%"/>
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

  // REJECT MEMES WITH INITIAL WARNING
  function deleteMeme(memeID) {
    console.log('Deleting meme', memeID);
    $.ajax({
      url: `/meme-generator/admin/delete/memes/${memeID}`,
      type: 'get',
      success: (msg) => {
        console.log(msg);
        $(`.meme-thumb[imageid=${memeID}]`).remove();
      },
    });
  }

  let confirmed = false;
  // Reject the memes
  $('.meme-thumb .reject-button').click(function () {
    // if they want to delete it
    if (confirmed) {
      deleteMeme($(this).parent().attr('imageid'));
    } else {
      // Sets confirmed to true or false based on response
      confirmed = confirm('Are you sure you want to delete this meme? ');
      if (confirmed) {
        deleteMeme($(this).parent().attr('imageid'));
      }
    }
  });
}





// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    III EDIT BUILDER
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

// DISPLAY THE RESULTING IMAGES
function displayEditThumbs(data) {
  $('#edit-thumbs').empty();
  $.each(data, (k, v) => {
    $('#edit-thumbs').prepend(`
      <div class='console-thumb'>
        <img imageID="${v.imageid}" src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${v.imageid}.jpg" alt="thumb"/>
      </div>`);
  });
  $('#edit-thumbs .console-thumb').click(function () {
    const thisID = $(this).find('img').attr('imageid');
    console.log('THISID', thisID);
    // const thisParent = $(this).parent().attr('id');
    // console.log('THISPARENT', thisParent)
    $('#background-thumbs-moderate').append(`
      <div class='meme-thumb' imageID="${thisID}">
        <div class="reject-button">X</div>
        <img src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${thisID}.jpg" alt="full" width="100%" alt="thumb"/>
      </div>`);
    $('#background-thumbs-moderate .reject-button').on('click', function () {
      // if they want to delete it
      let confirmed = false;
      console.log('click CONFIRMED', confirmed);
      if (confirmed) {
        $(this).parent().remove();
      } else {
        // Sets confirmed to true or false based on response
        confirmed = confirm('Are you sure you want to remove this image from the meme builder? ');
        console.log('CONFIRMED', confirmed)
        if (confirmed) {
          $(this).parent().remove();
        }
      }
    });
    $(this).remove();
  });
}

// SEARCH FOR BASE IMAGES
$('#btn-edit-search').on('click', function generic(event) {
  event.preventDefault();
  const form = $(this);
  let formData = {};
  formData.tags = $("#edit-builders input[name='search-tags']").val().toLowerCase();
  console.log('tags:', $("#edit-builders input[name='search-tags']").val().toLowerCase());
  $.ajax({
    url: '/meme-generator/admin/search',
    type: 'POST',
    data: formData,
    success: (responseObj) => {
      console.log('Response:');
      console.log(responseObj);
      displayEditThumbs(responseObj);
      formData = {};
      form.trigger('reset');
    },
  });
});

// DISPLAY THE BUILDERS YOU WANT TO EDIT
function displayBuildersToEdit(builders, targetID) {
  console.log('displayBuildersToEdit');
  return new Promise((resolve, reject) => {
    let count = builders.length;
    console.log(count);
    $(`#${targetID}`).empty();
    for (const builder of builders) {
      console.log(builder);
      const html = `
      <div class='builder' data-builderID='${builder.id}'>
        <img class='builder-meme' src='https://dmnmemeresized.s3.amazonaws.com/resized-${builder.firstMeme[0].date}.png'/>
        <span class='builder-head'>${builder.head}</span>
        <span class='builder-intro'>${builder.intro}</span>
        by <span class='builder-author'>${builder.author}</span>
        for <span class='builder-desk'>${builder.desk}</span>
      </div>
      `;
      $(`#${targetID}`).prepend(html);
      count -= 1;
      if (count === 0) {
        resolve(true);
      }
    }
  });
}


function buildMemeBackgroundsPreview(data) {
  $('#background-thumbs-moderate').empty();
  $.each(data, (k, v) => {
    console.log(v);
    $('#background-thumbs-moderate').prepend(`
      <div class='meme-thumb' imageID="${v}">
        <div class="reject-button">X</div>
        <img src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${v}.jpg" alt="full" width="100%" alt="thumb"/>
      </div>`);
  });
}


function displayEditMemeImages(backgrounds) {
  const imgs = backgrounds[0].images.split(',');
  buildMemeBackgroundsPreview(imgs);
}

var editBuilderID;

// Click on any of the filter option buttons
$('#edit-builders .btn').click(function generic() {
  // Get the target from the data attr
  const targetID = $(this).data('target');
  console.log(targetID);

  // Depending on the button you clicked
  switch (targetID) {
  //   // Filter by builder instructions
    case 'filter-builder': {
      // $('#filter-builder').empty();
      console.log('SEND AJAX');
      // PROMISE WORK TO BUILD AFTER QUERIES
      $.ajax({
        url: '/meme-generator/admin/search/memes/first',
        type: 'get',
        success: (builders) => {
          console.log(builders);
          displayBuildersToEdit(builders, 'edit-builder').then(() => {
            $('#edit-builders .builder').click(function () {
              // $('.publish').empty();
              $(this).siblings().remove();
              editBuilderID = $(this).data('builderid');
              console.log(editBuilderID);
              $.ajax({
                url: `/meme-generator/admin/search/backgrounds/byBuilder/${editBuilderID}`,
                type: 'get',
                success: (backgrounds) => {
                  console.log('BACKGROUNDS', backgrounds[0].images);
                  displayEditMemeImages(backgrounds);
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
    default: {
      console.log('There was an error in the filter switch');
    }
  }
});

$('#btn-update-builder').click(() => {
  const newBackgroundImages = [];
  $('#background-thumbs-moderate .meme-thumb').each(function () {
    newBackgroundImages.push($(this).attr('imageid'));
  });
  console.log(editBuilderID, JSON.stringify(newBackgroundImages));
  $.ajax({
    url: `/meme-generator/admin/edit/backgrounds/byBuilder/${editBuilderID}`,
    type: 'post',
    data: JSON.stringify(newBackgroundImages),
    processData: false,
    contentType: 'application/json; charset=utf-8',
    success: (response) => {
      console.log(response);
      $('#edit-thumbs').empty();
    },
    error: (err) => {
      console.log(err);
    },
  });
});




// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    IV CREATE GALLERY PAGE
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

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

function displayBuilders(builders, targetID) {
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
      $(`#${targetID}`).prepend(html);
      count -= 1;
      if (count === 0) {
        resolve(true);
      }
    }
    countMemes();
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
          displayBuilders(builders, 'filter-builder').then(() => {
            $('#filter-builder .builder').click(function () {
              $('.publish').empty();
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






// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    V PUBLISH GALLERY PAGE
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
$('#btn-publish').click(() => {
  event.preventDefault();
  console.log('Publishing a gallery page');
  const length = $('#meme-thumbs-publish .meme-thumb').length;
  console.log(length);

  let builderCode = `<!-- Paste this into a Serif page -->
<div class="meme-container">
  `;

  $('#meme-thumbs-publish .meme-thumb').each(function () {
    const imageID = $(this).attr('imageid');
    const thisEntry = `
    <div class="meme" style="margin-bottom:15px;">
      <img src="https://dmnmeme.s3.amazonaws.com/${imageID}.png" width="100%"/>
    </div>
`;
    builderCode += thisEntry;
  });
  builderCode += `
</div>`;
  console.log(builderCode);
  $('#code-snippet').text(builderCode);
  Rainbow.color();
});





// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////
//    DOCUMENT READY
// /////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////

$(document).ready(() => {

  let currentDestination = 'upload-meme';
  $(`#${currentDestination}`).show();
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
  // //////////////////////////////////////
  //    MAKE CONSOLE FOR PUBLISH SORTABLE
  // //////////////////////////////////////
  $('#meme-thumbs-publish').sortable({
    revert: true,
  });
  $('#page-images').sortable({
    revert: true,
  });

  $('.printShare').hide();
});
