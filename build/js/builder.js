/* global $:true  document:true, d3:true, _:true*/
$(document).ready(() => {
  // console.log('Ready');
  const imagesArray = images.split(',');

  // Build thumbs
  for (const image of imagesArray) {
    const thisLine = `<img class="thumb" data-image="${image}" src="https://dmnmemebaseresized.s3.amazonaws.com/resized-${image}.jpg" />`;
    $('#thumbsBox').append(thisLine);
  }
  const randomImage = _.random(imagesArray.length - 1);
  // console.log(randomImage);

  let imageLink = `https://dmnmemebase.s3.amazonaws.com/${imagesArray[randomImage]}.jpg`;
  // console.log(imageLink);

  // Stuff we'll use later
  const $memeContainer = $('#meme-container');
  const $canvas = $('#canvas');
  const canvas = document.getElementsByTagName('canvas')[0];
  const ctx = canvas.getContext('2d');

  let bottomFontRatio = 0.075;
  let topFontRatio = 0.075;
  const strokeRatio = 0.05;

  $('.socialShare').off();

  // Default text for meme is blank
  let topText = '';
  let bottomText = '';

  // LOAD THUMB IMAGE
  $('#thumbsBox img').click(function () {
    const targetImage = $(this).data('image');
    imageLink = `https://dmnmemebase.s3.amazonaws.com/${targetImage}.jpg`;
    mountImage(imageLink);
  });

  //--------------------------------------
  //  RESIZE MEME
  //--------------------------------------
  function resizeMeme() {
    // console.log('- Resize');
    // Make Responsive
    const memeWidth = $memeContainer.width();
    const memeHeight = memeWidth * imageRatio;
    // Meme width is 100%
    $memeContainer.height(memeHeight);
    // Adjust canvas to fit
    $canvas.outerWidth(memeWidth);
    $canvas.outerHeight(memeHeight);
    resizeFonts();
  }

  //--------------------------------------
  //   MOUNT IMAGES TO CANVAS
  //--------------------------------------
  function mountImage(imageLink) {
    // console.log("Mounting with "+imageLink);
    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () { // once loaded
      // The width/ratio of native photo
      imageWidth = this.naturalWidth;
      imageHeight = this.naturalHeight;
      imageRatio = imageHeight / imageWidth;
      // The width and height of canvas container div
      memeWidth = $memeContainer.width();
      memeHeight = memeWidth * imageRatio;
      // Set the attribute of the canvas to the container's div
      canvas.width = memeWidth;
      canvas.height = memeHeight;
      // console.log(imageWidth + " : " + imageHeight + " : " + imageRatio);
      // Actually draw the image at 0,0 with width and height
      ctx.drawImage(image, 0, 0, memeWidth, memeHeight);
      resizeMeme();
    };
    image.src = imageLink;
  }

  //--------------------------------------
  //  RESIZE FONTS
  //--------------------------------------
  function resizeFonts() {
    //console.log("- resizeFonts with "+bottomFontRatio+" and "+topFontRatio);
    let memeWidth = $memeContainer.width();

    topFontSize = memeWidth * topFontRatio;
    bottomFontSize = memeWidth * bottomFontRatio;

    topStrokeSize = Math.ceil(topFontSize * strokeRatio);
    bottomStrokeSize = Math.ceil(bottomFontSize * strokeRatio);

    $('#topLineText').css("font-size", topFontSize + "px");
    $('#topLineText').css("-webkit-text-stroke-width", topStrokeSize + "px");
    $('#bottomLineText').css("font-size", bottomFontSize + "px");
    $('#bottomLineText').css("-webkit-text-stroke-width", bottomStrokeSize + "px");

    console.log('imageLink',imageLink);
  }

  mountImage(imageLink); //Initial mount
  $(window).resize(function() { //On resize
    resizeMeme();
  });

  $(".minus").click(function() {
    //console.log("minus clicked");
    let memeWidth = $memeContainer.width();
    var selected = $(this).parent().attr("id");
    switch (selected) {
      case "topSizing":
        topFontRatio = topFontRatio - .005;
        resizeFonts();
        break;
      case "bottomSizing":
        bottomFontRatio = bottomFontRatio - .005;
        resizeFonts();
        break;
      default:
        //console.log("Error in plus switch");
    }
  });

  $(".plus").click(function() {
    //console.log("plus clicked");
    let memeWidth = $memeContainer.width();
    var selected = $(this).parent().attr("id");
    switch (selected) {
      case "topSizing":
        topFontRatio = topFontRatio + .005;
        resizeFonts();
        break;
      case "bottomSizing":
        bottomFontRatio = bottomFontRatio + .005;
        resizeFonts();
        break;
      default:
        //console.log("Error in plus switch");
    }
  });

  $('#build').click(() => {
    topText = $('#topLineText').val().toUpperCase();
    bottomText = $('#bottomLineText').val().toUpperCase();
    renderCanvas(topText, bottomText);
  });

  function saveCanvasToServer(canvas){
    //console.log('saveCanvasToServer...');
    const payload = {};
    payload.canvas = canvas;
    payload.tags = $('#dataStamp .pageTags').text();
    const d = new Date();
    const memeDate = d.getTime();
    payload.date = memeDate;
    payload.builder = $('#dataStamp .pageID').text();
    payload.top = topText;
    payload.bottom = bottomText;

    //console.log(payload);

    $.ajax({
      url: '/meme-generator/builder/upload',
      type: 'post',
      data: payload,
      success: function (responseObj) {
        $('#meme-container').empty().html(`<img src="https://dmnmeme.s3.amazonaws.com/${responseObj}" width="100%" />`);
        // console.log(responseObj);
        $('#build').hide();
        $('#save').show();
        $('#save').attr('href', `https://dmnmeme.s3.amazonaws.com/${responseObj}`);
        $('#save').attr('download', `https://dmnmeme.s3.amazonaws.com/${responseObj}`);

        $('.socialShare').css('opacity', 1);
        $('.socialShare').css('cursor', 'pointer');
        $('.socialShare').on();

        // ----------- RELOAD BUTTON
        $('#reload-section').show();
        $('#reload').click(() => {
          location.reload();
        });

        // -----------  SHARING -----------//
        const storyIMG = `https://dmnmeme.s3.amazonaws.com/${responseObj}`;
        const encodedIMGURL = encodeURIComponent(storyIMG);
        const encodedURL = encodeURIComponent(storyURL);

        $('#facebookButton').click(() => {
          // Facebook share
          FB.ui({
            method: 'feed',
            name: `${topText} ${bottomText}`,
            link: window.location.href,
            // caption: 'Use our meme generator to create your own!',
            picture: storyIMG,
            description: $('.pageIntro').text(),
          });
        });
      },
    });
  }

  function renderCanvas(topText, bottomText){
    //console.log(`renderCanvas() with ${imageLink}`);
    const canvas = document.getElementById('tgt');
    const ctx2 = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 630;
    //console.log(canvas.width+" "+canvas.height);

    const image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () { //once loaded
      // Actually draw the image at 0,0 with width and height
      ctx2.drawImage(image, 0, 0, 1200, 630);

      ctx2.textAlign = 'center';
      ctx2.lineJoin = 'round';
      ctx2.strokeStyle = 'black';
      ctx2.fillStyle = 'white';

      // Draw top text
      ctx2.font = (topFontSize*.85)+'pt Impact';
      ctx2.lineWidth = topStrokeSize*2;
      ctx2.textBaseline = 'top';
      ctx2.strokeText(topText, canvas.width / 2, 5);
      ctx2.fillText(topText, canvas.width / 2, 5);

      // Draw bottom text
      ctx2.font = `${(bottomFontSize * 0.85)}pt Impact`;
      ctx2.lineWidth = bottomStrokeSize * 2;
      ctx2.textBaseline = 'bottom';
      ctx2.strokeText(bottomText, canvas.width / 2, canvas.height - 5);
      ctx2.fillText(bottomText, canvas.width / 2, canvas.height - 5);

      const canvasData = canvas.toDataURL();
      saveCanvasToServer(canvasData);
    };
    image.src = imageLink;
  }
});
