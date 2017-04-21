/* global $:true,document:true,_:true*/
Rainbow.defer = true;

// //////////////////////////////////////////////
//    I. UPLOAD IMAGES
// //////////////////////////////////////////////

// Var because I can't figure out how to use let or const here...
var uploadFormData = new FormData();

// Display the last image uploaded
function displayLastSubmission(data) {
  const timer = setInterval(() => {
    $.get(`https://dmnmemebaseresized.s3.amazonaws.com/resized-${data.imageid}.jpg`)
      .done(() => {
        console.log('DONE image load');
        $('#upload-console').prepend(`
          <div class='console-thumb'>
          <img src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${data.imageid}.jpg" alt="thumb"/>
          </div>`);
        clearInterval(timer);
      }).fail(() => {
        console.log('FAILED image load');
      });
  }, 1000);
}

function logFormData(form) {
  // Display the key/value pairs
  for (const pair of form.entries()) {
    console.log(`${pair[0]}, ${pair[1]}`);
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
        displayLastSubmission(responseObj);
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

$('#builder-inputs input').on('keyup', function () {
  validate($(this));
});

// COUNT HEADLINE CHARACTERS FOR TWEET
var headTooLong = false;

$('#head-input').on('keyup', function () {
  const warningLength = 130;
  const alertLength = 140;
  const introLength = $(this).val().length;
  $('.char-remaining').text(alertLength - introLength);
  if (introLength < warningLength && introLength <= alertLength) {
    $(this).removeClass('lengthAlert');
    $(this).removeClass('lengthWarning');
  }
  if (introLength > warningLength && introLength <= alertLength) {
    $(this).removeClass('lengthAlert');
    $(this).addClass('lengthWarning');
  }
  if (introLength > alertLength) {
    $(this).removeClass('lengthWarning');
    $(this).addClass('lengthAlert');
    headTooLong = true;
  }
  console.log();
});

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
    formData.append('twitter', $("#builder-inputs input[name='twitter']").val());
    formData.append('hashtag', $("#builder-inputs input[name='hashtag']").val());
    formData.append('mention', $("#builder-inputs input[name='mention']").val());
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
      },
    });
  } else {
    alert("You're intro text is too long.");
  }
});







// //////////////////////////////////////////////
//    DEAL WITH THUMBS
// //////////////////////////////////////////////
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
        <img src="https://dmnmemeresized.s3.amazonaws.com/resized-${v.date}.png" alt="thumb" width="100%"/>
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
  let confirmed = false;
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

  // Reject the memes
  $('.reject-button').click(function () {
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
          displayBuilders(builders).then(() => {
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






// //////////////////////////////////////
//    IV Publish gallery page
// //////////////////////////////////////
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






// //////////////////////////////////////
// //////////////////////////////////////
//    DOCUMENT READY
// //////////////////////////////////////
// //////////////////////////////////////

$(document).ready(() => {

  console.log('Version 4/21 14:15');

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
  //
  // //////////////////////////////////////
  //    MAKE CONSOLE FOR PUBLISH SORTABLE
  // //////////////////////////////////////
  $('#meme-thumbs-publish').sortable({
    revert: true,
  });
  $('#page-images').sortable({
    revert: true,
  });

  // $('pre code').each((i, block) => {
  //   hljs.highlightBlock(block);
  // });

  // $('.theme').click(() => {
  //   $('.sideNav #upload-image').slideDown();
  // });

    $('.printShare').hide();
});
